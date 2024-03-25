#!/bin/sh

# Author: imshawan <hello@imshawan.dev>
# Date: 25-03-2024
# Description: Script to validate the format and content of git commit messages, ensuring adherence to specified conventions and length limits.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

MAX_COMMIT_LENGTH=100

is_valid_commit_type() {
    case "$1" in
        "#ci"|"#chore"|"#docs"|"#ticket"|"#feature"|"#fix"|"#perf"|"#refactor"|"#revert"|"#style"|"#new"|"#update"|"#misc")
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

is_valid_length() {
    [ ${#1} -le $MAX_COMMIT_LENGTH ]
}

validate_commit_message() {
    local commit_message="$1"
    local commit_type_count=$(echo "$commit_message" | grep -o '#[^:]*' | tr '[:upper:]' '[:lower:]' | uniq -d | wc -l)
    
    # Extracting commit type from the message
    commit_type=$(echo "$commit_message" | grep -o '#[^:]*' | head -n1)

    if [ "$commit_type" != "$(echo "$commit_type" | tr '[:upper:]' '[:lower:]')" ]; then
        echo -e "\n${RED}Error: Commit type must be in lowercase. e.g. #feature, #chore.${NC}"
        exit 1
    fi

    if ! is_valid_commit_type "$commit_type"; then
        echo -e "\n${RED}Error: Invalid commit type: $commit_type ${NC}"
        exit 1
    fi

    if [ "$commit_type_count" -gt 0 ]; then
        echo -e "\n${RED}Error: Commit type must not occur multiple times in the message.${NC}"
        exit 1
    fi
    
    if ! is_valid_length "$commit_message"; then
        echo -e "\n${RED}Error: Commit message length exceeds $MAX_COMMIT_LENGTH characters.${NC}"
        exit 1
    fi

    echo -e "\n${GREEN}Success: Commit message is valid, commiting code...${NC}"
}

if [ -z "$1" ]; then
    echo -e "\n${RED}Error: Commit message was not provided.${NC}"
    echo "Usage: $0 <commit_message>"
    exit 1
fi

commit_msg="$1"

validate_commit_message "$commit_msg"