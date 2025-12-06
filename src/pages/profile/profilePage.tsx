import { useAuth } from "../../hooks/useAuth";
import { toaster } from "../../components/toaster";
import { PageTitle } from "../../components/pageTitle";
import { Grid, GridItem } from "../../components/grid";
import { Button } from "../../components/buttons";

const ProfilePage = () => {
    const { user, logout } = useAuth();
    
    return (
        <div>
            <Grid rows={2} columns={2} gap={10}>
                <GridItem>
                    <PageTitle
                        title="Profile"
                        subtitle={user ? `Welcome back, ${user.displayName}` : "Please log in"}
                        photoIconUrl={user?.profilePicture}
                    />
                </GridItem>

                <GridItem>
                    <Button
                        onClick={async () => {
                            await logout();
                            toaster.info("You have been logged out.");
                        }}
                    >
                        Logout
                    </Button>
                </GridItem>
            </Grid>

            <Button
                onClick={() => {
                    toaster.success("You have successfully logged out!");
                }}
            >
                success
            </Button>
            <br />
            <Button
                onClick={() => {
                    toaster.error("An error occurred during logout.");
                }}
            >
                error
            </Button>
            <br />
            <Button
                onClick={() => {
                    toaster.info("This is some information for you.");
                }}
            >
                info
            </Button>
            <br />
            <Button
                onClick={() => {
                    toaster.warning("This is a warning message.");
                }}
            >
                warning
            </Button>
        </div>
    ); 
};
export default ProfilePage;
