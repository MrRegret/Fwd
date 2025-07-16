var WidgetMetadata = {
    id: "pexels_standard",
    title: "Pexels视频",
    description: "Pexels官方API视频资源",
    version: "1.0.1",
    requiredVersion: "0.0.1",
    modules: [
        {
            title: "视频获取",
            functionName: "getVideos",
            params: [
                {
                    name: "sourceType",
                    title: "获取方式",
                    type: "enumeration",
                    enumOptions: [
                        {title: "关键词搜索", value: "search"},
                        {title: "随机获取", value: "random"}
                    ],
                    value: "search"
                },
                {
                    name: "keyword",
                    title: "搜索关键词",
                    type: "input",
                    description: "当获取方式为关键词搜索时生效",
                    value: "nature",
                    belongTo: {
                        paramName: "sourceType",
                        value: ["search"]
                    }
                },
                {
                    name: "category",
                    title: "视频分类",
                    type: "enumeration",
                    enumOptions: [
                        {title: "自然", value: "nature"},
                        {title: "科技", value: "technology"},
                        {title: "动物", value: "animals"},
                        {title: "城市", value: "city"}
                    ],
                    value: "nature",
                    belongTo: {
                        paramName: "sourceType",
                        value: ["random"]
                    }
                },
                {
                    name: "apiKey",
                    title: "Pexels API密钥",
                    type: "input",
                    description: "从Pexels官网申请的API密钥",
                    required: true,
                    value: ""
                }
            ],
            cacheDuration: 3600
        }
    ]
};

async function getVideos(params) {
    if (!Widget.config.apiKey) {
        throw new Error("API密钥未配置");
    }
    
    const response = await Widget.http.get(`https://api.pexels.com/videos/search`, {
        headers: {
            Authorization: Widget.config.apiKey
        },
        query: {
            query: params.category,
            per_page: 20
        }
    });
    
    return response.data.videos.map(video => ({
        id: `pexels_${video.id}`,
        type: "video",
        title: video.user.name,
        duration: video.duration,
        coverUrl: video.image,
        videoUrl: video.video_files
            .filter(f => f.width > 1920)
            .sort((a,b) => b.width - a.width)[0].link
    }));
}
if (typeof params.category !== 'string') {
    throw new TypeError("分类参数必须为字符串类型");
}
try {
    // ...
} catch (error) {
    console.error(`[ErrorCode:PE01] 视频获取失败: ${error.message}`);
    throw new Error("视频加载失败，请检查网络连接");
}
async function getVideos(params) {
    // 参数验证移至函数内部
    if (!Widget.config.apiKey) {
        throw new Error("API密钥未配置");
    }
    
    if (typeof params !== 'object' || params === null) {
        throw new TypeError("参数必须为对象");
    }
    
    let url = "https://api.pexels.com/videos/search";
    const queryParams = { per_page: 20, orientation: "landscape" }; // 强制横版视频
    
    // 根据获取方式构建请求参数
    if (params.sourceType === "search") {
        if (typeof params.keyword !== 'string' || params.keyword.trim() === "") {
            throw new Error("搜索关键词不能为空");
        }
        queryParams.query = params.keyword.trim();
    } else {
        // 随机获取模式下使用分类
        if (!params.category || typeof params.category !== 'string') {
            throw new Error("请选择视频分类");
        }
        queryParams.query = params.category;
        queryParams.random = true;
    }
    
    try {
        const response = await Widget.http.get(url, {
            headers: {
                Authorization: Widget.config.apiKey
            },
            query: queryParams
        });
        
        // 处理视频数据
        return response.data.videos.map(video => {
            // 筛选高清横版视频
            const videoFile = video.video_files
                .filter(f => f.width >= 1920 && f.quality === "hd")
                .sort((a, b) => b.width - a.width)[0];
                
            if (!videoFile) {
                console.warn(`视频 ${video.id} 没有合适的高清资源`);
                return null;
            }
            
            return {
                id: `pexels_${video.id}`,
                type: "video",
                title: video.user.name,
                subtitle: video.url,
                duration: video.duration,
                coverUrl: video.image,
                videoUrl: videoFile.link,
                aspectRatio: video.width / video.height
            };
        }).filter(Boolean); // 过滤空值
    } catch (error) {
        console.error(`[ErrorCode:PE01] 视频获取失败: ${error.message}`);
        throw new Error("视频加载失败，请检查API密钥和网络连接");
    }
}