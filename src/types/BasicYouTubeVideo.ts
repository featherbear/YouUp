export default interface BasicYouTubeVideo {
    title: string
    description: string
    privacy: 'public' | 'unlisted' | 'private'
}