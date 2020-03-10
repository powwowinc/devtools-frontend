#!/bin/sh

# Run this script to build the inspector. The built "inspector" folder needs to go in smartux-build/inspector,
# and is checked in.  Tag it with a new # and update that # the PowwowDesigner/webapp/bower.json file.


if [ "$1" != "debug" ] && [ "$1" != "release" ] ; then
  echo "Please specify either 'debug' or 'release' argument"
  exit
fi

if [ "$1" = "debug" ] && [ ! -d "$2" ] && [ ! -d "$2/webapp/app/bower_components/devtools/smartux-build/inspector" ] ; then
  echo "If debug, please also specify root 'PowwowDesigner' folder that has a built inspector folder"
  exit
fi

echo "* Cleaning out existing inspector build"
rm -rf inspector

if [ ! -d "$PWD/depot_tools" ] ; then
  echo "* Cloning Chromium depot_tools used to perform the build"
  git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

  echo "* Updating Chromium devtools-frontend repository location with PowWow's"
  sed -i '' -f devtools_to_powwow.sed depot_tools/fetch_configs/devtools-frontend.py
  sed -i '' -f devtools_to_powwow.sed depot_tools/recipes/recipe_modules/gclient/config.py
fi

echo "* Adding depot tools to the path"
export PATH=$PWD/depot_tools:$PATH

if [ "$1" = "debug" ] && [ ! -d "$PWD/devtools-frontend" ]; then
  echo "* Fetching the devtools-frontend (with history)"
  fetch devtools-frontend
elif [ "$1" = "release" ] ; then
  echo "* Fetching the devtools-frontend (without history so it downloads faster)"
  fetch --no-history devtools-frontend
fi

echo "* Building the devtools-frontend using Google's tools"
cd devtools-frontend
gn gen out/Default
autoninja -C out/Default

echo "* Copying the updated built resources to the top level (to this folder)"
mv out/Default/resources/inspector ../inspector

if [ "$1" = "release" ] ; then
  echo "* Cleaning up everything that was downloaded"
  cd ..
  rm -rf devtools-frontend depot_tools .gclient_entries .gclient .cipd
elif [ "$1" = "debug" ] ; then
  cd ..
  echo "* Copying built inspector folder over to PowwowDesigner"
  rm -rf "$2/webapp/app/bower_components/devtools/smartux-build/inspector"
  cp -r inspector "$2/webapp/app/bower_components/devtools/smartux-build/"
fi
