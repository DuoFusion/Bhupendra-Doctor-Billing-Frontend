import ProfileCard from "../../components/common/profile/ProfileCard";
import ProfileDetailsForm from "../../components/common/profile/ProfileDetailsForm";

const Profile = () => {
  return (
    <section className="profile-theme min-h-[calc(100vh-7rem)] px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <div className="relative mx-auto overflow-hidden rounded-2xl border border-[#d4deef] bg-[#f4f7fd]">
        <div className="h-28 bg-[radial-gradient(circle_at_8%_20%,#6f8df5_0,#4d6ad9_38%,transparent_40%),radial-gradient(circle_at_72%_-10%,#6f8df5_0,#3954ba_50%,transparent_55%),linear-gradient(120deg,#3755c8_0%,#2e4cb4_45%,#20409f_100%)]" />

        <div className="pointer-events-none absolute left-6 top-4 h-14 w-14 rounded-full border border-white/30" />
        <div className="pointer-events-none absolute right-12 top-10 h-8 w-8 rotate-45 border border-white/25" />

        <div className="-mt-12 p-4 sm:p-6">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <ProfileCard />
            </div>

            <div className="lg:col-span-8">
              <ProfileDetailsForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
