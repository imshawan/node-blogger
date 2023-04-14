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
    isActive?: boolean
    deleted?: boolean
    createdAt?: string
    updatedAt?: string
}

interface Counters {
    posts?: number
    tags?: number
}