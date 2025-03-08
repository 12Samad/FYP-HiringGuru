import Image from "next/image"

export default function Team() {
  const team = [
    {
      name: "Sher Ali",
      image: "/1000028282.jpg",
      description: "Sher lead the development of the backend, ensuring a smooth and reliable user experience.",
    },
    {
      name: "Abdus Samad Kaleem",
      image: "/Screenshot 2024-10-31 190914.png",
      description: "Samad crafted the user interface, making Ace both user-friendly and visually appealing.",
    },
    {
      name: "Muhammad Ayan",
      image: "/Screenshot 2024-10-31 191134.png",
      description: "Ayan integrated the AI system, enabling realistic and interactive mock interview simulations.",
    },
  ]

  return (
    <section className="px-4 py-12 text-center md:px-12">
      <h2 className="text-2xl font-bold text-[#6666FF]">MEET THE TEAM</h2>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <div key={member.name} className="rounded-xl bg-[#0F1111] p-6 text-center">
            <div className="relative mx-auto mb-4 h-[220px] w-[220px] overflow-hidden rounded-full">
              <Image
                src={member.image || "/placeholder.svg"}
                alt={`${member.name}'s profile picture`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
            <p className="text-xl font-bold text-white">{member.name}</p>
            <p className="mt-2 text-gray-400">{member.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

