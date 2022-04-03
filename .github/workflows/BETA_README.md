for beta versions we publish them manually

    git fetch --all
    git checkout main
    npm version 1.0.0-beta.0
    npm publish --tag beta
    git push origin main --tags

NB: we don’t push npmjs to avoid triggering publish action