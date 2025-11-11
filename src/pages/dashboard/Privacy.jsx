import React from "react";

const Privacy = () => {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 bg-white shadow-xl rounded-[30px]">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>

      <section>
        <h2 className="text-lg font-semibold mt-2">1. Introduction</h2>
        <p>
          Welcome to First Date. Your privacy is important. This policy explains how we collect,
          use, and protect your personal information when you use the app.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mt-2">2. Information We Collect</h2>
        <p>
          We may collect information you provide directly and information collected automatically
          (usage, device info). We use it to provide and improve the service.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mt-2">3. How We Use Your Information</h2>
        <p>
          Information is used to operate the service, communicate with you, and for safety and analytics.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mt-2">4. How We Protect Your Information</h2>
        <p>
          We implement administrative, technical, and physical safeguards to protect your data.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mt-2">5. Sharing Your Information</h2>
        <p>
          We do not sell your personal information. We may share data with service providers and as required by law.
        </p>
      </section>
    </div>
  );
};

export default Privacy;