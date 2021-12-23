export default interface PlaylistObject {
    id: string
    title: string // 150 character limit
    description: string // 5000 character limit
    publishedAt: string // ISO 8601 date of playlist creation
    thumbnails: GoogleApiYouTubeThumbnailResource
    privacyStatus: 'public' | 'unlisted' | 'private'
    itemCount: number
}