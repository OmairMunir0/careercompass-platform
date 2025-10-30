import { Search, Users, MessageSquare, Briefcase } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Search className="w-8 h-8 text-purple-600" />,
      title: "Smart Job Search",
      description: "Find your perfect job with advanced filters and AI-powered recommendations.",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Talent Discovery",
      description: "Connect with top candidates and build your dream team efficiently.",
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: "Direct Communication",
      description: "Seamless messaging between recruiters and candidates.",
    },
    {
      icon: <Briefcase className="w-8 h-8 text-purple-600" />,
      title: "Profile Management",
      description: "Showcase your skills and experience with comprehensive profiles.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose SkillSeeker?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform offers everything you need to succeed in today's competitive job market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
