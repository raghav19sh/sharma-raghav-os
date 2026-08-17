import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const musicDirectory = path.join(
      process.cwd(),
      "public",
      "music"
    );

    if (!fs.existsSync(musicDirectory)) {
      return NextResponse.json([]);
    }

    const files = fs
      .readdirSync(musicDirectory)
      .filter((file) => {
        return /\.(mp3|wav|ogg|m4a)$/i.test(file);
      })
      .sort((a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );

    const songs = files.map((file) => {
      const extension = path.extname(file);
      const filename = path.basename(file, extension);

      return {
        title: filename,
        artist: "Raghav",
        src: `/music/${encodeURIComponent(file)}`,
      };
    });

    return NextResponse.json(songs, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to read music directory",
      },
      {
        status: 500,
      }
    );
  }
}