/**
 * @date 18-05-2024
 * @author imshawan <github@imshawan.dev>
 *
 * @description List of namespaces used in the application for i18next translations.
 * Each namespace corresponds to a different section or module of the application.
 * For example: 'common' for common translations, 'consent' for consent related translations, etc.
 */
const namespaces: string[] = ['common', 'consent', 'user', 'post', 'blog'];

/**
 * Default namespace used when a namespace is not specified explicitly.
 * Typically, this is the namespace for common translations.
 */
const defaultNS: string = 'common'

export default { namespaces, defaultNS } as const;
