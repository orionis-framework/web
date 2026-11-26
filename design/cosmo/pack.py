"""Build the downloadable Cosmo gallery using only the Python standard library."""

from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZIP_STORED, ZipFile, ZipInfo


PUBLIC = Path(__file__).resolve().parents[2] / "public"
IMAGES = PUBLIC / "images" / "cosmo"
OUTPUT = PUBLIC / "downloads" / "cosmo-gallery.zip"


def build() -> None:
    entries = {}
    for source in sorted(IMAGES.rglob("*.webp")):
        name = source.name if source.name.startswith("cosmo-") else f"cosmo-{source.name}"
        if name in entries:
            raise ValueError(f"Duplicate download name: {name}")
        entries[name] = source
    if not entries:
        raise ValueError(f"No WebP images found under {IMAGES}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(dir=OUTPUT.parent) as staging:
        archive = Path(staging) / OUTPUT.name
        with ZipFile(archive, "w", compression=ZIP_STORED) as bundle:
            for name, source in sorted(entries.items()):
                info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                bundle.writestr(info, source.read_bytes())

        with ZipFile(archive) as bundle:
            if bundle.namelist() != sorted(entries):
                raise ValueError("The download does not match the gallery file list")
            for name, source in entries.items():
                if bundle.read(name) != source.read_bytes():
                    raise ValueError(f"The contents of {name} differ from {source}")

        archive.replace(OUTPUT)
    print(f"Packed {len(entries)} verified images into {OUTPUT.name}")


if __name__ == "__main__":
    build()
