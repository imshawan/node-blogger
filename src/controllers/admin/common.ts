/**
 * @date 24-11-2023
 * @author imshawan <hello@imshawan.dev>
 * @description This file contains all the common constants required by the admin controllers to work
 */

import { IRegistrationTypes } from "@src/types";

export const sorting = {
    "Default": "default",
    "Most recent": "recent",
    "Oldest": "oldest",
    "Popularity": "popular",
    "More posts": "posts",
}
export const availableRegisterationTypes: IRegistrationTypes = {
    "default": "Default",
    "inviteOnly": "invite Only",
    "adminInviteOnly": "Admin Invites only",
    "disabled": "Disabled"
};

/**
 * @see {@link https://www.npmjs.com/package/zxcvbn}
 */
export const passwordScoresWithMessage = [
    {
      "strength": 0,
      "label": "too guessable",
      "message": "Easy for someone to guess. (less than 1000 guesses)"
    },
    {
      "strength": 1,
      "label": "very guessable",
      "message": "Can withstand common online attacks. (less than a million guesses)"
    },
    {
      "strength": 2,
      "label": "somewhat guessable",
      "message": "Can resist online attacks, but not very strong. (less than 100 million guesses)"
    },
    {
      "strength": 3,
      "label": "safely unguessable",
      "message": "Moderately secure against offline slow-hacking attempts. (less than 10 billion guesses)"
    },
    {
      "strength": 4,
      "label": "very unguessable",
      "message": "Highly secure against offline slow-hacking attempts. (10 billion or more guesses)"
    }
  ]
  