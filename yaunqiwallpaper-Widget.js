var WidgetMetadata = {
    id: "cheetah_wallpaper",
    title: "元气壁纸",
    description: "元气壁纸横屏动态资源抓取",
    version: "1.1.0",
    requiredVersion: "0.0.1",
    modules: [
        {
            title: "壁纸获取",
            functionName: "getWallpapers",
            params: [
                {
                    name: "sourceType",
                    title: "资源类型",
                    type: "enumeration",
                    enumOptions: [
                        {title: "分类浏览", value: "category"},
                        {title: "关键词搜索", value: "search"}
                    ],
                    value: "category"
                },
                {
                    name: "category",
                    title: "壁纸分类",
                    type: "enumeration",
                    enumOptions: [
                        {title: "动态风景", value: "1"},
                        {title: "动态动漫", value: "2"},
                        {title: "动态游戏", value: "4"},
                        {title: "动态科幻", value: "7"}
                    ],
                    value: "1",
                    belongTo: {
                        paramName: "sourceType",
                        value: ["category"]
                    }
                },
                {
                    name: "keyword",
                    title: "搜索关键词",
                    type: "input",
                    description: "支持动漫、风景、游戏等关键词",
                    value: "星空",
                    belongTo: {
                        paramName: "sourceType",
                        value: ["search"]
                    }
                },
                {
                    name: "screenType",
                    title: "屏幕类型",
                    type: "enumeration",
                    enumOptions: [
                        {title: "横屏优先", value: "landscape"},
                        {title: "竖屏优先", value: "portrait"},
                        {title: "全部类型", value: "all"}
                    ],
                    value: "landscape"
                },
                {
                    name: "page",
                    title: "页码",
                    type: "count",
                    value: 1,
                    min: 1,
                    max: 50
                }
            ],
            cacheDuration: 1800
        }
    ]
};

async function getWallpapers(params) {
    try {
        const baseUrl = "https://bizhi.cheetahfun.com";
        let url = "";
        
        // 构建请求URL
        if (params.sourceType === "search") {
            // 关键词搜索接口
            url = `${baseUrl}/search?q=${encodeURIComponent(params.keyword)}&page=${params.page}`;
        } else {
            // 分类浏览接口（动态壁纸专用）<mcreference link="https://blog.csdn.net/bujhg/article/details/131027366" index="3"></mcreference>
            url = `${baseUrl}/dn/c${params.category}d/p${params.page}`;
        }
        
        // 发送请求
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": baseUrl
            }
        });
        
        // 解析HTML
        const docId = Widget.dom.parse(response.data);
        const items = Widget.dom.select(docId, "li.float-left");
        
        // 处理结果
        return items.map(item => {
            // 提取图片信息
            const img = Widget.dom.selectFirst(item, "img");
            const link = Widget.dom.selectFirst(item, "a");
            
            // 提取宽高信息
            const width = parseInt(img.width || img.dataset.width) || 0;
            const height = parseInt(img.height || img.dataset.height) || 0;
            const aspectRatio = width / height;
            
            // 横屏筛选
            if (params.screenType === "landscape" && aspectRatio < 1.3) {
                return null; // 过滤非横屏
            }
            
            // 构建动态壁纸URL
            const detailUrl = `${baseUrl}${link.href}`;
            const wallpaperId = detailUrl.match(/(\d+)\.html/)[1];
            const videoUrl = `https://video.cheetahfun.com/${wallpaperId}.mp4`;
            
            return {
                id: `cheetah_${wallpaperId}`,
                type: "video", // 动态壁纸标记为video类型
                title: img.alt || `动态壁纸_${wallpaperId}`,
                coverUrl: img.src.startsWith("//") ? `https:${img.src}` : img.src,
                videoUrl: videoUrl,
                aspectRatio: aspectRatio,
                width: width,
                height: height
            };
        }).filter(Boolean);
    } catch (error) {
        console.error(`[ErrorCode:CW02] 壁纸获取失败: ${error.message}`);
        throw new Error("动态壁纸加载失败，请检查网络连接");
    }
}