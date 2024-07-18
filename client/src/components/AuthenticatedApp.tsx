import LogoutButton from "./auth/LogoutButton";
import NewsletterList from "./NewsletterList";
import EmailList from "./EmailList";
import NewsletterForm from "./NewsletterForm";

const AuthenticatedApp = () => {
  return (
    <>
      <div className="logout-container">
        <LogoutButton />
      </div>
      <NewsletterForm />
      <NewsletterList />
      <EmailList />
    </>
  );
};

export default AuthenticatedApp;
