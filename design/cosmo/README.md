# Cosmo artwork

[cosmo-source.png](cosmo-source.png) is the 1536 × 1024 RGB illustration “Cosmo, el lince estelar.png”. It includes the four poses and the Cosmo wordmark on a cream background.

The [four original web images](../../public/images/cosmo/) use transparent WebP. The paper and ground shadows have been removed so each pose can sit on the site's light and dark backgrounds.

| Asset                | Size      | Source crop¹           | Detail                                                                               |
| -------------------- | --------- | ---------------------- | ------------------------------------------------------------------------------------ |
| `cosmo-star.webp`    | 666 × 898 | `53, 0, 738, 914`      | Large pose on the left, holding a star in one paw.                                   |
| `cosmo-wave.webp`    | 287 × 324 | `748, 294, 1041, 621`  | Seated pose in the center, waving with eyes closed.                                  |
| `cosmo-explore.webp` | 408 × 279 | `1090, 294, 1517, 585` | Crouching pose on the right, with its cyan constellation.                            |
| `cosmo-avatar.webp`  | 256 × 256 | `152, 0, 713, 551`     | Square crop of the star pose’s face, including both ear stars, for small placements. |

¹ Pillow crop coordinates are in source pixels from the top left, in the order left, top, right, bottom. The right and bottom edges are exclusive.

## Mask and export

1. The NumPy and SciPy mask kept the dark outlines, saturated colors and cool white fur. It filled enclosed areas such as the eyes, then reopened gaps matching the warm paper. Sampling the centers of thin cyan strokes preserved the ear stars, sparks and constellation. The lower edge of the explore pose’s white chin was traced where it meets the paper.
2. At each boundary, nearby paper and foreground samples gave an estimate of the original pixel’s opacity. Removing the estimated paper color from partially transparent pixels prevented cream fringes on dark backgrounds.
3. Each full pose was trimmed to its visible pixels and given 7 px of transparent padding. The avatar follows the original jawline, centered in a square with 18 px added to the longer dimension, then resized to 256 px using Lanczos.
4. Pillow encoded the RGBA images as WebP with `quality=90`, `alpha_quality=100` and `method=6`. The decoded files were checked on `#ffffff` and `#101e30`, including the avatar at 32, 40, 64 and 88 px.

## Gallery artwork

The [gallery directory](../../public/images/cosmo/gallery/) contains seven additional WebP illustrations. The three transparent stickers were created with the original character sheet as a reference and checked on light and dark backgrounds.

| File                   | Illustration                                                                |
| ---------------------- | --------------------------------------------------------------------------- |
| `stargazer.webp`       | Cosmo sits beneath three connected stars, looking up with a paw raised.     |
| `leap.webp`            | Cosmo leaps towards a turquoise star.                                       |
| `nap.webp`             | Cosmo curls up with closed eyes and rests on his paws.                      |
| `night-sky.webp`       | Panoramic night landscape with Cosmo on a ridge, following a shooting star. |
| `first-contact.webp`   | Cosmo reaches for a medallion bearing the Orionis symbol.                   |
| `standard-bearer.webp` | Cosmo carries a banner bearing the Orionis symbol.                          |
| `hello-orionis.webp`   | Cosmo waves from behind a plaque bearing the Orionis symbol.                |

### Download bundle

The [gallery ZIP](../../public/downloads/cosmo-gallery.zip) includes the original four illustrations and the seven gallery illustrations at their web resolution. To rebuild it from the repository root, run:

```sh
python design/cosmo/pack.py
```

The script uses the Python standard library. It collects every WebP beneath `public/images/cosmo/`, prefixes each download name with `cosmo-` if needed, stores the entries in alphabetical order with a fixed timestamp, and checks each archived file against its source before replacing the bundle.
