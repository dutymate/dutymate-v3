import { SEO } from "@/components/SEO";
import Footer from "@/components/organisms/Footer";
import SignupForm from "@/components/organisms/SignupForm";
import LandingTemplate from "@/components/templates/LandingTemplate";
import { useIsApp } from "@/hooks/useIsApp";

const Signup = () => {
  const isApp = useIsApp();

  return (
    <>
      <SEO
        title="회원가입 | Dutymate"
        description="듀티메이트의 회원가입 페이지입니다."
      />
      <div className="min-h-screen flex flex-col">
        <LandingTemplate showIntroText={false}>
          <SignupForm />
        </LandingTemplate>
        {!isApp && (
          <div className="mt-auto">
            <Footer />
          </div>
        )}
      </div>
    </>
  );
};

export default Signup;
