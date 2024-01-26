export interface ICategory {
    _key?: string
    _scheme?: string
    cid?: number
    parent?: number
    userid?: number
    name?: string
    description?: string
    blurb?: string
    slug?: string
    thumb?: string | null | undefined
    altThumb?: string | null | undefined
    tags?: number
    posts?: number
    tagsPerPost?: TagsPerPost
    isActive?: boolean
    deleted?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface ICategoryTag {
    _key?: string
    _scheme?: string
    cid?: number
    tagId?: number
    userid?: number
    name?: string
    slug?: string
    posts?: number
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