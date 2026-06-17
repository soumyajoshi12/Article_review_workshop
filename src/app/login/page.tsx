
import LoginButton from "~/components/auth/LoginButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#1F2937_0%,#0F766E_100%)] p-2">
      <div className="w-full max-w-[450px] rounded-2xl bg-white p-5 text-center shadow-2xl md:p-10">

        <div className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#0F766E] text-[32px] font-bold text-white">
          📚
        </div>

        <h1 className="mb-1 text-4xl font-bold text-[#1F2937]">
          Article Review Workshop
        </h1>

        <p className="mb-4 text-base text-[#6B7280]">
          Review, organize, and collaborate on research articles in one place.
        </p>

        <div className="flex justify-center">
          <LoginButton />
        </div>

        <p className="mt-4 text-sm text-[#9CA3AF]">
          Secure authentication powered by your organization.
        </p>
      </div>
    </div>
  );
}
