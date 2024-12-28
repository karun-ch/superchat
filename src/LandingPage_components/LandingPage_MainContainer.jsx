import LandingPage__Left_Container from "./LandingPage__Left_Container";
import useDispatchHeader from '../customHooks/useDispatchHeader'
//import LandingPage_Right_Container from "./LandingPage_Right_Container";


export default function LandingPage_MainContainer() {
  useDispatchHeader()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 bg-slate-50 min-h-[300px] gap-4">
      {/* Left Container */}
      <div className="col-span-1 sm:col-span-2">
        <LandingPage__Left_Container />
      </div>

      {/* Right Container */}
      <div className="col-span-1">
        {/* Right side container */}
        <div className="sm:hidden">
          {/* Mobile view */}
         {/* <LandingPage_Right_Container /> */}
        </div>
        <div className="hidden sm:block">
          {/* Desktop view */}
         {/* <LandingPage_Right_Container /> */}
         </div>
      </div>
    </div>
  );
}
