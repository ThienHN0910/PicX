import React from 'react';
import { useParams } from 'react-router-dom';
import { User, Globe, Instagram, Twitter, Facebook, Award, Calendar } from 'lucide-react';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/ProductCard';

const ArtistProfile = () => {
  const { id } = useParams();
  const { products } = useStore();

  // Mock artist data - replace with actual data fetching
  const artist = {
    name: "Jane Smith",
    bio: "Contemporary artist specializing in abstract expressionism and mixed media artwork. Based in New York City.",
    profile_picture: "https://images.pexels.com/photos/3799786/pexels-photo-3799786.jpeg",
    specialization: "Abstract Expressionism",
    experience_years: 8,
    website_url: "https://janesmith.art",
    social_media: {
      instagram: "janesmith_art",
      twitter: "janesmith_art",
      facebook: "janesmitheartist"
    }
  };

  const artistProducts = products.filter(product => product.artist_id.toString() === id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Artist Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 h-48 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={artist.profile_picture}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{artist.name}</h1>
            <p className="text-gray-600 mb-4">{artist.bio}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">
                  Specializes in {artist.specialization}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">
                  {artist.experience_years} years of experience
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {artist.website_url && (
                <a
                  href={artist.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Globe className="h-5 w-5" />
                  <span>Website</span>
                </a>
              )}
              {artist.social_media.instagram && (
                <a
                  href={`https://instagram.com/${artist.social_media.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                >
                  <Instagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
              )}
              {artist.social_media.twitter && (
                <a
                  href={`https://twitter.com/${artist.social_media.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-500"
                >
                  <Twitter className="h-5 w-5" />
                  <span>Twitter</span>
                </a>
              )}
              {artist.social_media.facebook && (
                <a
                  href={`https://facebook.com/${artist.social_media.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Facebook className="h-5 w-5" />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Artist's Artwork */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Artwork</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artistProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;