import { Button } from "antd";

export const LandingPage = () => {
  return (
    <div>
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        <h1 className="text-6xl max-w-3xl my-12 text-center font-bold text-teal-800">
          Solve all your problems with us
        </h1>
        <p className="text-center text-teal-700 leading-7">
          Join the millions of companies of all sizes who use Superservice to solve all kind of problems. Say goodbye to
          everyday stress and hello to a better way of running your business.
        </p>
        <div className="my-12">
          <Button className="hover:scale-110 transition-all duration-200" type="primary" size="large">
            <a href={"/auth"}>Sign up</a>
          </Button>
        </div>
      </div>
    </div>
  );
};
