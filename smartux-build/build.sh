# Run this script to build the inspector. The built "inspector" folder needs to go in smartux-build/inspector,
# and is checked in.  Tag it with a new # and update that # the PowwowDesigner/webapp/bower.json file.

# Clone Chromium depot_tools used to build.
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

# Replace the Chromium devtools-frontend repository location with Powwow's.
sed -i '' -f devtools_to_powwow.sed depot_tools/fetch_configs/devtools-frontend.py
sed -i '' -f devtools_to_powwow.sed depot_tools/recipes/recipe_modules/gclient/config.py

# Add depot tools to the path.
export PATH=$PWD/depot_tools:$PATH

# Get the devtools-frontend (without history so it downloads faster)
fetch --no-history devtools-frontend

# Build the devtools-frontend
cd devtools-frontend
gn gen out/Default
autoninja -C out/Default

# Clean out existing resources, and copy the updated built resources to the top level (to this folder)
rm -rf inspector
mv out/Default/resources/inspector ../inspector

# Cleanup
cd ..
rm -rf devtools-frontend depot_tools .gclient_entries .gclient .cipd
