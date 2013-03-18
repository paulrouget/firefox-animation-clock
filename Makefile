FILES = chrome/ \
				locale/ \
				bootstrap.js \
				chrome.manifest \
				install.rdf

all:
	rm -f animclock.xpi && zip -r animclock.xpi $(FILES)
	wget --post-file=$(PWD)/animclock.xpi http://localhost:8888/
