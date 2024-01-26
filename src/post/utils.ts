import { database } from '@src/database';
import { slugify } from '@src/utilities';
import { application } from '@src/application';

const generatePostslug = async function generatePostslug(title: string): Promise<string> {
    let slug = slugify(title);

    const post = await database.getObjects({
        slug: { $regex: new RegExp(`^[0-9]+\/${slug}`), $options: "i" },
        _scheme: "post:postId",
    }, [], {multi: true});

    if (post && post.length) {
        return String(slug + '-' + (post.length + 1));
    }

    return slug;
}

const generateNextPostId = async function generateNextPostId(): Promise<number> {
    const id = await database.incrementFieldCount('post');
    return Number(id);
}

const isValidStatus = function (status: string) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!status) {
        throw new Error('Status is required.');
    }

    return validStatuses.includes(String(status).toLowerCase().trim());
}

export default {
    generatePostslug, generateNextPostId, isValidStatus,
} as const