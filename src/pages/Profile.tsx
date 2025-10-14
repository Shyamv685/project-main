import ProfileForm from "@/components/profile/ProfileForm";

export default function Profile() {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your personal information</p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
