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
    // 修改前
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
    // 修改后
    if (!params.apiKey) {
        throw new Error("API密钥未配置");
    }
    
    const response = await Widget.http.get(`https://api.pexels.com/videos/search`, {
        headers: {
            Authorization: params.apiKey
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
    throw new Error("视频加载失败，请检查API密钥和网络连接");
}
}