#!/bin/sh

# Run this script to build the inspector. The built "inspector" folder needs to go in smartux-build/inspector,
# and is checked in.  Tag it with a new # and update that # the PowwowDesigner/webapp/bower.json file.

echo "* Cleaning out existing inspector build"
rm -rf inspector

echo "* Cloning Chromium depot_tools used to perform the build"
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

echo "* Updating Chromium devtools-frontend repository location with PowWow's"
sed -i '' -f devtools_to_powwow.sed depot_tools/fetch_configs/devtools-frontend.py
sed -i '' -f devtools_to_powwow.sed depot_tools/recipes/recipe_modules/gclient/config.py

echo "* Adding depot tools to the path"
export PATH=$PWD/depot_tools:$PATH

echo "* Fetching the devtools-frontend (without history so it downloads faster)"
fetch --no-history devtools-frontend

echo "* Building the devtools-frontend using Google's tools"
cd devtools-frontend
gn gen out/Default
autoninja -C out/Default

echo "* Copying the updated built resources to the top level (to this folder)"
mv out/Default/resources/inspector ../inspector

echo "* Cleaning up everything that was downloaded"
cd ..
rm -rf devtools-frontend depot_tools .gclient_entries .gclient .cipd
