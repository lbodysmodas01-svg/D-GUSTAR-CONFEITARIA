import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Instagram, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Portfolio: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="p-20 text-center text-pink-500 animate-pulse font-bold uppercase tracking-widest">Carregando Portfólio...</div>;

  return (
    <div className="min-h-screen bg-pink-50/30 pb-20">
      <header className="bg-white border-b border-pink-100 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-pink-500 p-1">
             <div className="w-full h-full rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold overflow-hidden">
                <img src="https://instagram.fbsb8-2.fna.fbcdn.net/v/t51.82787-19/670890316_18463978237098931_1939052380474147205_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMxIn0&_nc_ht=instagram.fbsb8-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2gGSQIlauX8HC4IONqw2QlhR75_ruB9XeY9RjMfQWF956GXRsSdl4RlTtIvH-qMwZlESKXIu8Ptd9-Zh0VjwCQT4&_nc_ohc=fJOjnzz8Gq4Q7kNvwERdeH5&_nc_gid=OeJ8Kj6BVrbG0JNwZRyWbQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af3JzXFx1kzZeCM1sD-iZqfaNjSWnubzw8rbhZEsd3k7nA&oe=69E70A05&_nc_sid=7a9f4b" alt="D'GUSTAR" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-pink-800 tracking-tighter">PORTFÓLIO DIÁRIO</h1>
            <p className="text-sm text-pink-600/70 font-medium">Acompanhe nossas produções artesanais</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full border-pink-200 text-pink-600 gap-2 hover:bg-pink-50"
            onClick={() => window.open('https://www.instagram.com/dgustar_confeitariagourmet/', '_blank')}
          >
            <Instagram className="w-4 h-4" /> Seguir no Instagram
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-2">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="italic">Nenhuma postagem no portfólio ainda.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-2">
            {posts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group rounded-xl overflow-hidden bg-white shadow-sm break-inside-avoid"
              >
                <img 
                  src={post.imageUrl} 
                  alt={post.description} 
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  {post.description && (
                     <p className="text-white text-xs font-medium mb-2 line-clamp-2">{post.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-pink-400">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-[10px] font-bold">D'GUSTAR</span>
                    </div>
                    {post.instagramLink && (
                       <a 
                        href={post.instagramLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 px-2 rounded bg-white/20 text-white text-[10px] uppercase font-bold backdrop-blur-sm flex items-center gap-1 hover:bg-white/40"
                       >
                         Ver <ExternalLink className="w-3 h-3" />
                       </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-pink-100 p-4 text-center">
         <Button 
            className="rounded-full bg-pink-600 hover:bg-pink-700 font-bold px-8"
            onClick={() => window.location.href = '/'}
         >
           Voltar ao Cardápio
         </Button>
      </div>
    </div>
  );
};
