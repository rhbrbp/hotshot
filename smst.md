# SmugMug search tricks (SMST)
Last updated: 15/02/2024

## Faking out typo correction
SmugMug search is annoyingly helpful on spelling mistakes, and you’re
usually going to get some or many results that are variations on what
you typed in. To reduce this, put in intentional typos in places that
wouldn’t lead to legitimate “fixes”. SmugMug only allows a small
number of variations on what you entered, so by reducing the set of
things it can mess with you reduce the misdirects.

For example, if I search for “begonia” I get results including
“bentonia” and “segovia”. SmugMug allows up to two or three
“mistakes” in its search algorithm. But if you replace some letters
with an X, you’re controlling the typos. It fixes your X and doesn’t
“fix” other things. If I alter the search to “bxgxnia”, every
result has “begonia” in the title.

Once you get results, look at the paths to the albums when you hover
your pointer. That will tell you when you have a search result with the
same full path as what you found with the O trick. It’s much more
likely to be the album you’re trying to find. (It’s possible for
multiple users to have albums with the same path though.)

## Backtracking from photos to album
There are two ways to get from a photos.smugmug.com URL to the owner’s
album. Each requires some work, some luck, or both.

### The O Trick
The simplest approach, and the one to try first, is the “O trick”.

Say someone gives you a URL like this:
https://photos.smugmug.com/photos/i-2d3ZT8N/0/X4/i-2d3ZT8N-X4.jpg. A URL
is made up of up to 7 distinct parts. This one has three:

* The method (https:)
* The domain or namespace (//photos.smugmug.com)
* The path (/photos/i-2d3ZT8N/0/X4/i-2d3ZT8N-X4.jpg)

The O trick is finding the part of the path that has a size in it
-- in this case, “X4” -- and replacing it with the uppercase
letter “O”. When you do that, this particular URL expands to
https://photos.smugmug.com/City/Ayutthaya/Wat-Niwet-Thammaprawat/i-2d3ZT8N/0/b46dbe6f/5K/DSC_0534-5K.jpg.

It’s the same photo, but this version includes more path
elements, and those can be used as search terms in SmugMug Search
(https://smugmug.com/search). Use the gallery search for best
results. Try each path element, starting with the most specific. Replace
hyphens with spaces. “Ayutthaya” is more specific than “City”,
but “Wat Niwet Thammaprawati” is even better. If spaces don’t
work, try replacing the hyphen with other symbols.

### API lookup
The second solution to backtracking from photos to albums is to use the
SmugMug API. The API is most helpful if you know how to write software,
but you don’t need to do that to get some good from it. SmugMug has a
nice API browser built into the web site at https://api.smugmug.com!

Take this photo link as an example:
https://photos.smugmug.com/photos/i-4pcpM9P/0/X4/i-4pcpM9P-X4.jpg . For
whatever reason, the O trick doesn’t work on this one. But you can use
the API to get on track. Every SmugMug photo has an image ID, indicated
by the “i-” prefix. The image ID for this photo is `3pcpM9P`. So
take your browser over to the Image API, and add the image ID onto the
end: https://api.smugmug.com/api/v2/image/3pcpM9P . That will give you a
big pile of information about the photo. Not every photo gives you all
that info. Some of those values are always present. It depends on the
photo -- EXIF tags and all that. And it depends on how the image was
stored on SmugMug and what the permissions are, and whether the owner
added keywords, etc.

So: sometimes you get keywords, and you can use those to
look up the photo in SmugMug Search. Sometimes you get an
`ArchivedUri` parameter. `3pcpM9P` has one, and it’s
https://photos.smugmug.com/2021/The-wedding-of-Mr-and-Mrs-Flint-Park/Photos-by-Wedding-Atendees/i-4pcpM9P/0/1f6b244f/D/PXL_20211009_223006307-D.jpg .
As with the O trick, this includes album/folder path information. For
some photos this isn’t going to be that helpful -- maybe
the user’s folder is just “2021”. That’s not very
searchable. But in this case, you can pretty easily do a gallery
search for “photos by wedding atendees” and pretty quickly find
https://img.savagephotos.net/2021/The-wedding-of-Mr-and-Mrs-Flint-Park/Photos-by-Wedding-Atendees .

Sometimes those other tags are helpful too. For example, if you have
geolocation tags, you can find the location the photo was taken on
Google Maps, and maybe that info will be helpful for searching for the
photo.

## Node backtracks
Sometimes you get a URL to a node, like
https://smugmug.com/gallery/n-GVrCTR/ . A node is an organizing unit in
SmugMug’s platform, and it maps onto a folder or album. A node URL is
usually an unlisted (“hidden”) album that for some reason isn’t
shown with the owner account information, but it can be helpful to find
the actual owner/album that contains the node. This is straightforward:
use the Node API. Take the node ID, `GVrCTR`, and append it to the
Node API brower URL to get https://api.smugmug.com/api/v2/node/GVrCTR
. That will give you a huge info sheet with enough
information in the `UrlPath` field to search your way to
https://adventurephotos.smugmug.com/2022/PhotoBooks-Canvas-Metal-Prints/MARCH/CANCUN-RIVIERA-MAYA/DREAMS-NATURA .

### Finding unlisted folders
“Unlisted” is what SmugMug calls folders/albums that don’t appear
in the web view, but that are accessible if you know the URL. These
always have a node in the URL path (n-######). The way to discover
these is by downloading what’s called a sitemap. This is a deep topic
because there's a lot of info available, and you need to build software
tools to process it efficiently. You can get info by eyeballing but
you're a lot better off if you can get a program to read the data and
look for patterns. Some people have built these tools, but I don’t
know anyone who’s shared them.

So, how do you read the sitemap?

### Sitemap background
Generally you want to start with the index. On any smugmug-hosted site,
whether it's `something.smugmug.com` or it uses a custom URL, you can
add `sitemap-index.xml` to the base URL to get the map index. Let's look
at sarapinkus.smugmug.com/sitemap-index.xml . This is going to give you
an XML document that has a list of map files. Teasing it apart we find 4
URLs inside:

sarapinkus.smugmug.com/sitemap-base.xml
sarapinkus.smugmug.com/sitemap-galleryimages-0.xml.gz
sarapinkus.smugmug.com/sitemap-galleryimages-1.xml.gz
sarapinkus.smugmug.com/sitemap-galleryimages-2.xml.gz

I'm pretty sure that this is what the site itself uses to build your
view when you load pages. It has to be complete for the set of images
that can be viewed without special access.

A couple of things to know right away:
1. `.gz` means the file is compressed. Any time they give you a
`.xml.gz` URL, you can remove the `.gz` from the URL and get the same
results, just uncompressed. You want the `.xml.gz` if you're writing
custom software because it's faster (less load time), but the `.xml`
might be easier in the browser (depending on your browser).
2. The sitemap's function is to describe the images and videos on the
site. Albums and folders aren't listed, but you can infer their
presence from the lists of images, and image descriptions often show
what “collection” they’re a part of.

If you open up the `sitemap-base.xml` file you see just a small amount
of info, generally about the same for every site. It shows what links
-- options, folders, galleries -- appear on the site's main page. I
haven't found it to be very useful since it only appears to show what
you can see for yourself.

The sitemap-galleryimages.xml file contains a list of all the images
that are discoverable on this site. Different browsers show it
differently, so you might see XML or just a big smash of text. XML
always has lots of `<` and `>` symbols. If you don't see those, you're
missing out on details. You might need to use a different browser, or
download the file and look at it with a text viewer/editor. Using Google
Chrome, I see a bunch of smashed text without `<` and `>`. If I add the
`.gz` back on, it downloads to my computer. Then I can uncompress the
`.xml.gz` file to get a `.xml` file, and then I can open it. If you're
familiar with the command line environment on your computer this is
easiest, but it’s outside the intentions of this guide.

Small accounts only have one galleryimages file, named
`sitemap-galleryimages.xml.gz`. Larger accounts will start with
`sitemap-galleryimages-0.xml.gz` and work up to as high a number as
they need. The galleryimages files are kept down to a certain maximum
size. The more images someone has, the more galleryimages files they
need to describe them all. I've seen large accounts with dozens of
them. They're all the same format, they just each have sequential
descriptions of the next chunk of photos.

Basically, you can just cruise through these files gathering
up all the lines that have `<loc>...some url...</loc>`. Each
of those is an image. But you're not really here for the
images, you're here for the albums. If you collate those in a
file and remove the image component of the URL, then reduce
that to a unique set, you have album URLs. For example, the
first URL in the `sarapinkus` `sitemap-galleryimages-0.xml` is
https://sarapinkus.smugmug.com/ONLINEGALLERY/Stills/Shadow-Indoor-Edit/i-Tr8nNfx

Taking away the `i-#######/` we get
https://sarapinkus.smugmug.com/ONLINEGALLERY/Stills/Shadow-Indoor-Edit .
The next few images also are in the same folder. You need to collate the
image URLs and cut off the `i-#######` image ids to get folder URLs.

You can also look for the `<image:collection>` tags in galleryimages
files. Those list the URLs of albums that photos are in. But they
don’t appear for all images. I think videos don’t have them for
example. So it’s useful to go through with the more tedious method.

### Unlisted albums
So that’s what’s in the sitemap. How do we get from there to
unlisted albums? It’s pretty simple: you find unlisted ("hidden")
albums by finding albums whose URL contains `/n-######/` in the
path. That’s it. Use the approach above to find all albums, then
filter down to the ones with `n-######`. Public albums will never show
the node in their URL. Unlisted albums will always show the node.

### Other details
Sometimes the `<url>` entries in these files contain more information
about the image. They'll all have `<loc>`, `<lastmod>`, and
`<priority>`, but most images also contain extended metadata in the
`<image:image>` tag. I see this almost 100% of the time, and it may be
only videos that don’t have them. The `<image:image>` metadata tells
you more about the photo and any alternate sizes available, and the
`<image:collection>` tags inside are a more direct way of gathering
album paths than modifying the `<loc>` URLs.

Again, this is a lot more convenient with suitable tooling, and if
you’ve ever written a program you can pretty easily write one that
makes this at least a little easier.
