"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { SITE } from "@/lib/data";
import { getInstagramPosts, InstagramPost } from "@/actions/instagram";

const OFFICIAL_INSTAGRAM = "https://www.instagram.com/__hijabistaa__";

const FALLBACK_POSTS: InstagramPost[] = [
  { id: "1", image_url: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=600&auto=format&fit=crop", link_url: OFFICIAL_INSTAGRAM, caption: "Flowing Double Layer Abaya", display_order: 1, is_active: true },
  { id: "2", image_url: "https://images.unsplash.com/photo-1608228079968-c76819b11456?q=80&w=600&auto=format&fit=crop", link_url: OFFICIAL_INSTAGRAM, caption: "Medina Silk Hijab Collection", display_order: 2, is_active: true },
  { id: "3", image_url: "https://images.unsplash.com/photo-1598555310619-74d32049d5c4?q=80&w=600&auto=format&fit=crop", link_url: OFFICIAL_INSTAGRAM, caption: "Luxe Salwar Suit Details", display_order: 3, is_active: true },
  { id: "4", image_url: "https://images.unsplash.com/photo-1621217036662-79ee88619379?q=80&w=600&auto=format&fit=crop", link_url: OFFICIAL_INSTAGRAM, caption: "Royal Blue Jilbab Set", display_order: 4, is_active: true },
  { id: "5", image_url: "https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=600&auto=format&fit=crop", link_url: OFFICIAL_INSTAGRAM, caption: "Handwork Khimar Elegance", display_order: 5, is_active: true },
  { id: "6", image_url: "https://images.unsplash.com/photo-1616781296191-49e3975000a6?q=80&w=600&auto=format&fit=crop", link_url: OFFICIAL_INSTAGRAM, caption: "Modest Fashion Inspiration", display_order: 6, is_active: true },
];

export default function InstagramGallery() {
  const [posts, setPosts] = useState<InstagramPost[]>(FALLBACK_POSTS);

  useEffect(() => {
    getInstagramPosts()
      .then((data) => {
        if (data && data.length > 0) {
          setPosts(data);
        }
      })
      .catch((err) => console.error("Error loading instagram posts:", err));
  }, []);

  return (
    <section className="py-8 md:py-16 bg-cream overflow-hidden">
      <div className="max-w-wrap mx-auto px-5 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-display font-semibold text-3xl md:text-4xl text-ink tracking-tight mb-3">
            Join the Hijabistaa Family
          </h2>
          <a
            href={OFFICIAL_INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-ink/70 hover:text-gold transition-colors font-medium text-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            @{SITE.instagram}
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link_url || OFFICIAL_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block w-full aspect-square group overflow-hidden rounded-xl bg-cream-deep border border-cream-line/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <Image
                src={post.image_url}
                alt={post.caption || "Instagram post"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 text-center">
                <svg className="w-8 h-8 text-cream shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
