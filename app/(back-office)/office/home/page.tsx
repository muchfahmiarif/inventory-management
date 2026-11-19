import { redirect } from "next/navigation";

const HomePage = () => {
  redirect("/office/home/inventory-dashboard");
};

export default HomePage;
