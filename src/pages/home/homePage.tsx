import { useAuth } from "../../hooks/useAuth";

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div>
            <button onClick={() => console.log(user)}>Log Auth</button>
        </div>
    );
};
export default HomePage;
