import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { badgesApi, membersApi } from '@/services/api';
import type { Badge, Member } from '@/types';

export default function Community() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([badgesApi.getAll(), membersApi.getAll()])
      .then(([badgesRes, membersRes]) => {
        setBadges(badgesRes.data);
        setMembers(membersRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative bg-dark py-20 md:py-28">
        <div className="container-custom text-center">
          <p className="font-heading text-gold uppercase tracking-[0.2em] text-sm mb-4">
            Nuestra Familia
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-gold tracking-wider">
            Comunidad
          </h1>
        </div>
      </section>

      {/* Badges */}
      <section className="section-padding bg-cream">
        <div className="container-custom">
          <h2 className="font-display text-3xl md:text-4xl text-dark tracking-wider mb-8 text-center">
            Insignias
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-4 text-center group hover:border-gold transition-colors"
                >
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{
                      backgroundColor: badge.color ? `${badge.color}20` : '#C9A84C20',
                    }}
                  >
                    <span className="text-2xl font-display" style={{ color: badge.color || '#C9A84C' }}>
                      {badge.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-dark line-clamp-2">
                    {badge.name}
                  </h3>
                  {badge.description && (
                    <p className="text-xs text-dark-light mt-1 line-clamp-2">
                      {badge.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Members */}
      <section className="section-padding bg-dark">
        <div className="container-custom">
          <h2 className="font-display text-3xl md:text-4xl text-gold tracking-wider mb-8 text-center">
            Miembros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-dark p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold font-heading font-bold text-lg">
                      {member.user.firstName?.charAt(0)}
                      {member.user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading text-cream font-semibold">
                      {member.user.firstName} {member.user.lastName}
                    </h3>
                    {member.groupName && (
                      <p className="text-silver text-sm">{member.groupName}</p>
                    )}
                  </div>
                </div>

                {member.badges.length > 0 && (
                  <div>
                    <p className="text-gold text-xs font-heading uppercase tracking-wider mb-2">
                      Insignias
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.badges.map((mb) => (
                        <span
                          key={mb.badge.id}
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: mb.badge.color
                              ? `${mb.badge.color}30`
                              : '#C9A84C30',
                            color: mb.badge.color || '#C9A84C',
                          }}
                        >
                          {mb.badge.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
