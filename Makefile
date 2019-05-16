build: fetch
	mkdir -p build
	inkscape --without-gui packages/chrome.svg --export-png build/chrome.png

package: clean build
	zip --recurse-paths package.zip manifest.json background.js build packages

fetch:
	./fetch

clean:
	rm -Rf build packages package.zip

.PHONY: build fetch
