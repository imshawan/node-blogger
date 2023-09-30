export interface ICategory {
    _key?: string
    cid?: number
    parent?: number
    userid?: number
    name?: string
    description?: string
    blurb?: string
    slug?: string
    thumb?: string | null | undefined
    altThumb?: string | null | undefined
    tags?: Array[] | string
    counters?: Counters
    tagsPerPost?: TagsPerPost
    isActive?: boolean
    deleted?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface ICategoryTag {
    _key?: string
    cid?: number
    tagid?: number
    userid?: number
    name?: string
    deleted?: boolean
    deletedAt?: string
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