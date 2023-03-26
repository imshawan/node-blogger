export const slugify = (str: string, ignoreCase=false, separator='-') => {
    str = String(str).toString();
    str = str.replace(/^\s+|\s+$/g, ""); // trim
    str = !ignoreCase ? str.toLowerCase() : str;

    // remove accents, swap ñ for n, etc
    const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    const to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    return str
        .normalize('NFD')                   // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '')    // remove all previously split accents
        .replace(/[^a-z0-9 -]/g, "")        // remove invalid chars
        .replace(/\s+/g, separator)         // collapse whitespace and replace by -
        .replace(/-+/g, "-")                // collapse dashes
        .replace(/^-+/, "")                 // trim - from start of text
        .replace(/-+$/, "");
};