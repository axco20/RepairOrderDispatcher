import React, { FC } from 'react';
import Image from 'next/image';
import { Shield, Activity, Users } from 'lucide-react';

const About: FC = () => {
  // Leadership team data
  const leadershipTeam = [
    {
      name: "Alexander Corea",
      role: "Co-Developer",
      image: "/api/placeholder/300/300",
    },
    {
      name: "Lucas Sotomayor",
      role: "Co-Developer",
      image: "/api/placeholder/300/300",
    },
  ];

  // Core values data
  const coreValues = [
    {
      icon: <Shield className="h-12 w-12 text-blue-600" />,
      title: "Customer Success",
      description: "We succeed only when our customers succeed. Every feature we build is designed to solve real problems and deliver measurable value."
    },
    {
      icon: <Activity className="h-12 w-12 text-blue-600" />,
      title: "Continuous Improvement",
      description: "We're never satisfied with the status quo. We constantly gather feedback and iterate on our platform to make it better every day."
    },
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      title: "Industry Expertise",
      description: "Our team combines deep automotive industry knowledge with software expertise to create solutions that truly work for repair businesses."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
        About AutoDispatch
      </h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
        We&apos;re on a mission to revolutionize workflow management for auto repair businesses.
      </p>
      
      {/* Company story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          
        </div>
        <div className="relative w-full h-[400px]">
          <Image
            src="/api/placeholder/600/400"
            alt="AutoDispatch Team"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="rounded-lg shadow-xl object-cover"
          />
        </div>
      </div>
      
      {/* Core values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {coreValues.map((value, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="flex justify-center mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Team section */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Leadership Team</h2>
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8">
          {leadershipTeam.map((person, index) => (
            <div key={index} className="text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  sizes="160px"
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
              <p className="text-gray-600">{person.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;