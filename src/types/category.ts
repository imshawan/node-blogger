export interface ICategory {
    _key?: string
    cid?: number
    parent?: number
    userid?: number
    name?: string
    description?: string
    blurb?: string
    slug?: string
    thumb?: string
    counters?: Counters
    tagsPerPost?: TagsPerPost
    isActive?: boolean
    deleted?: boolean
    createdAt?: string
    updatedAt?: string
}

interface Counters {
    posts?: number
    tags?: number
}

interface TagsPerPost {
    min: number
    max: number
}