// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/9607#issuecomment-569173956

interface YoutubeServiceClient {
    activities: gapi.client.youtube.activities
    channelBanners: gapi.client.youtube.channelBanners
    channels: gapi.client.youtube.channels
    guideCategories: gapi.client.youtube.guideCategories
    playlistItems: gapi.client.youtube.playlistItems
    playlists: gapi.client.youtube.playlists
    search: gapi.client.youtube.search
    subscriptions: gapi.client.youtube.subscriptions
    thumbnails: gapi.client.youtube.thumbnails
    videoCategories: gapi.client.youtube.videoCategories
    videos: gapi.client.youtube.videos
}

declare namespace gapi.client {
    const youtube: YoutubeServiceClient
}
