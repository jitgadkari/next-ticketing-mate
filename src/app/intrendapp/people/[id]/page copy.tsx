

// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// interface Person {
//   _id: string;
//   Name: string;
//   Phone: string;
//   Email: string;
//   TypeEmployee: string;
//   linked: string;
//   linked_to: string;
//   linked_to_id: string;
//   created_date: string;
//   updated_date: string;
// }

// const PersonDetailPage = ({ params }: { params: { id: string } }) => { 
//   const router = useRouter();
//   // const { id } = router; // Dynamic route parameter
//   const [person, setPerson] = useState<Person | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (id) {
//       const fetchPerson = async () => {
//         try {
//           console.log(`Fetching details for person with id: ${id}`);
//           const response = await fetch(`http://localhost:8000/people/${id}`);
//           if (response.ok) {
//             const data = await response.json();
//             console.log('Fetched person data:', data);
//             setPerson(data.person);
//           } else {
//             console.error('Failed to fetch person details:', response.statusText);
//           }
//         } catch (error) {
//           console.error('Error fetching person details:', error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchPerson();
//     }
//   }, [id]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!person) {
//     return <div>No person found</div>;
//   }

//   return (
//     <div className="p-8 bg-white rounded shadow">
//       <h1 className="text-2xl font-bold mb-4">Person Details</h1>
//       <p><strong>Name:</strong> {person.Name}</p>
//       <p><strong>Phone:</strong> {person.Phone}</p>
//       <p><strong>Email:</strong> {person.Email}</p>
//       <p><strong>Type of Employee:</strong> {person.TypeEmployee}</p>
//       <p><strong>Linked:</strong> {person.linked}</p>
//       <p><strong>Linked To:</strong> {person.linked_to}</p>
//       <p><strong>Linked To ID:</strong> {person.linked_to_id}</p>
//       <p><strong>Created Date:</strong> {new Date(person.created_date).toLocaleString()}</p>
//       <p><strong>Updated Date:</strong> {new Date(person.updated_date).toLocaleString()}</p>
//     </div>
//   );
// };

// export default PersonDetailPage;
