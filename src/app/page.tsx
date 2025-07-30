import Link from "next/link";


export default function Home() {
  return (
    
    <div>
      <h1 className="text-amber-700">Home</h1><br/>
      <Link href={"/auth/login"}>LOgin</Link><br/>
      <Link href={"/auth/register"}>Register</Link>

    </div>
  );
}
