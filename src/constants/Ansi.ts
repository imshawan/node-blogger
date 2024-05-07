/**
 * @date 07-05-2024
 * @author imshawan <hello@imshawan.dev>
 * 
 * @description Defines ANSI escape codes for text styling in the terminal as an enum.
 * ANSI escape codes allow styling text in terminal interfaces by manipulating text attributes.
 * This module exports an enum with various ANSI escape codes for bold, italic, underline, inverse, strikethrough, and reset styles.
 * These codes can be used to style text output in terminal applications.
 *
 * @module ANSI
 */

/**
 * Enum representing ANSI escape codes for text styling in terminal interfaces.
 * @readonly
 * @enum {string}
 */
export enum ANSI {
    /**
     * ANSI escape code for bold text.
     */
    BOLD = '\x1b[1m',

    /**
     * ANSI escape code for italic text.
     */
    ITALIC = '\x1b[3m',

    /**
     * ANSI escape code for underlined text.
     */
    UNDERLINE = '\x1b[4m',

    /**
     * ANSI escape code for inverse text (swap background and foreground colors).
     */
    INVERSE = '\x1b[7m',

    /**
     * ANSI escape code for strikethrough text.
     */
    STRIKETHROUGH = '\x1b[9m',

    /**
     * ANSI escape code to reset text formatting.
     */
    RESET = '\x1b[0m'
}
