var WidgetMetadata = {
    id: "pexels-video-wallpaper",
    title: "Pexels横版视频壁纸",
    description: "从Pexels获取高质量横版视频壁纸",
    author: "Your Name",
    site: "https://www.pexels.com",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    modules: [
        {
            // 删除:name属性
            title: "随机视频壁纸",
            description: "随机获取Pexels横版视频壁纸",
            requiresWebView: false,
            functionName: "getRandomVideo",
            params: [
                {
                    name: "apiKey",
                    title: "Pexels API Key",
                    type: "input",
                    description: "用于认证的Pexels API密钥",
                    value: "your_api_key"
                },
                {
                    name: "query",
                    title: "关键词",
                    type: "input",
                    description: "可选视频搜索关键词",
                    value: ""
                }
            ]
        },
        {
            // 删除:name属性
            title: "视频搜索",
            description: "通过关键词搜索视频壁纸",
            requiresWebView: false,
            functionName: "searchVideos",
            params: [
                {
                    name: "apiKey",
                    title: "Pexels API Key",
                    type: "input",
                    description: "用于认证的Pexels API密钥",
                    value: "your_api_key"
                },
                {
                    name: "query",
                    title: "关键词",
                    type: "input",
                    description: "视频搜索关键词",
                    value: "nature",
                    placeholders: [
                        { title: "自然风光", value: "nature" },
                        { title: "城市景观", value: "city" },
                        { title: "科技", value: "technology" }
                    ]
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page",
                    description: "分页页码",
                    value: 1
                }
            ]
        }
    ]
};

async function getRandomVideo(params = {}) {
    try {
        // 参数验证
        if (!params.apiKey) {
            throw new Error("缺少必要参数：apiKey");
        }

        // 构建请求URL
        const url = params.query 
            ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(params.query)}&orientation=landscape&per_page=1` 
            : `https://api.pexels.com/videos/popular?orientation=landscape&per_page=1`;

        // 发送请求
        const response = await Widget.http.get(url, {
            headers: {
                "Authorization": params.apiKey,
                "User-Agent": "ForwardWidget/1.0",
                "Accept": "application/json"
            }
        });

        // 删除:详细的调试日志
        // 删除:console.log("API响应状态码:", response.status);
        // 删除:console.log("API响应数据预览:", JSON.stringify(response.data, null, 2));

        // 响应数据验证
        if (!response.data || !response.data.videos || response.data.videos.length === 0) {
            throw new Error("API返回数据格式错误或无视频数据");
        }

        const video = response.data.videos[0];
        const videoUrl = video.video_files.find(f => f.quality === 'hd')?.link || video.video_files[0].link;
        
        // 严格匹配示例数据模型
        return [{
            id: video.id.toString(),
            type: "video",  // 改为与示例完全一致的"video"类型
            title: "Pexels视频壁纸",
            coverUrl: video.image,
            videoUrl: videoUrl
        }];
    } catch (error) {
        // 删除:详细的错误日志
        // 删除:console.error("获取随机视频失败:", error.message);
        // 删除:console.error("错误堆栈:", error.stack);
        throw error;
    }
}

async function searchVideos(params = {}) {
    try {
        // 参数验证
        if (!params.apiKey || !params.query) {
            throw new Error("缺少必要参数：apiKey 或 query");
        }

        // 构建分页请求URL
        const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(params.query)}&orientation=landscape&per_page=15&page=${params.page}`;

        // 发送请求
        const response = await Widget.http.get(url, {
            headers: {
                "Authorization": params.apiKey,
                "User-Agent": "ForwardWidget/1.0",
                "Accept": "application/json"
            }
        });

        // 删除:详细的调试日志
        // 删除:console.log("搜索API响应状态码:", response.status);
        // 删除:console.log("搜索API响应数据预览:", JSON.stringify(response.data, null, 2));

        // 响应数据验证
        if (!response.data || !response.data.videos || response.data.videos.length === 0) {
            throw new Error("未找到匹配的视频");
        }

        // 严格匹配示例数据模型
        return response.data.videos.map(video => {
            const videoUrl = video.video_files.find(f => f.quality === 'hd')?.link || video.video_files[0].link;
            
            return {
                id: video.id.toString(),
                type: "video",  // 改为与示例完全一致的"video"类型
                title: "Pexels视频壁纸",
                coverUrl: video.image,
                videoUrl: videoUrl
            };
        });
    } catch (error) {
        throw error;
    }
}
