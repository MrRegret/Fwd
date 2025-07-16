var WidgetMetadata = {
    id: "pexels-video-widget",
    title: "Pexels 视频组件",
    description: "从Pexels获取高质量横版视频",
    author: "用户自定义",
    site: "https://www.pexels.com",
    version: "1.0.0",
    requiredVersion: "1.0.0",
    modules: [
        {
            title: "随机视频",
            description: "随机获取高质量横版视频",
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
            title: "关键词搜索",
            description: "通过关键词搜索视频",
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

        // 解析响应数据
        if (!response.data || !response.data.videos || response.data.videos.length === 0) {
            throw new Error("未找到视频数据");
        }

        const video = response.data.videos[0];
        const videoUrl = video.video_files.find(f => f.quality === 'hd')?.link || video.video_files[0].link;

        // 返回标准化数据
        return [{
            id: `pexels-${video.id}`,
            type: "url",
            title: video.user.name,
            posterPath: video.image,
            backdropPath: video.image,
            releaseDate: video.date_captured,
            mediaType: "video",
            videoUrl: videoUrl,
            link: video.url
        }];
    } catch (error) {
        console.error("获取随机视频失败:", error);
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

        // 解析响应数据
        if (!response.data || !response.data.videos || response.data.videos.length === 0) {
            throw new Error("未找到匹配的视频");
        }

        // 标准化返回数据
        return response.data.videos.map(video => {
            const videoUrl = video.video_files.find(f => f.quality === 'hd')?.link || video.video_files[0].link;
            
            return {
                id: `pexels-${video.id}`,
                type: "url",
                title: video.user.name,
                posterPath: video.image,
                backdropPath: video.image,
                releaseDate: video.date_captured,
                mediaType: "video",
                videoUrl: videoUrl,
                link: video.url
            };
        });
    } catch (error) {
        console.error("视频搜索失败:", error);
        throw error;
    }
}