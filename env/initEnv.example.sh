#!/bin/bash
export ETSY_API_KEY=mySecretKeyHere
export ETSY_SHOP=myShop
export ETSY_LANG=fr

# Test ENV
export ETSY_TEST_API_KEY=${ETSY_API_KEY}
export ETSY_TEST_SHOP_NAME=${ETSY_SHOP}
# export ETSY_TEST_SHOP_ID=12345
# export ETSY_TEST_LISTING_ID="12345"
# export ETSY_REDIRECT_URI="https://www.exemple.com/api/v0/etsy/callback"

# in order to play manual oauth test
# setup oAuth2 ETSY_TEST_ACCESS_TOKEN using OAuth Service to retrieve this access token