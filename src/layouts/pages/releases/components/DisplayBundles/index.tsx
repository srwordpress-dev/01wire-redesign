import { useState, useEffect, useRef } from "react";
import DefaultPricingCard from "../DefaultPricingCard";
import MDBox from "components/MDBox";
import Slider from "react-slick";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import IconButton from "@mui/material/IconButton";
import BundlePublicationModal from "../BundlePublicationModal";

// Custom arrow component for previous button
const PrevArrow = ({ onClick }: { onClick?: any }) => {
  return (
    <IconButton style={{ position: "absolute", top: "50%", left: "-50px", background: "#fff" }}>
      <KeyboardArrowLeftIcon onClick={onClick} />
    </IconButton>
  );
};

// Custom arrow component for next button
const NextArrow = ({ onClick }: { onClick?: any }) => {
  return (
    <IconButton style={{ position: "absolute", top: "50%", right: "-38px", background: "#fff" }}>
      <KeyboardArrowRightIcon onClick={onClick} />
    </IconButton>
  );
};

const settings = {
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 3,
  className: "center",
  infinite: false,
  centerPadding: "60px",
  prevArrow: <PrevArrow />,
  nextArrow: <NextArrow />,
};

const DisplayBundles = ({
  bundles,
  handleChange,
  selected,
  disabled = false,
  category,
}: {
  bundles: any;
  handleChange?: (category: any, bundle: any) => void;
  selected: any;
  disabled: boolean;
  category?: string;
}) => {
  const [open, setOpen] = useState<any>(false);
  const sliderRef = useRef(null);
  useEffect(() => {
    if (sliderRef.current && !disabled) {
      sliderRef.current.slickGoTo(0);
    }
  }, [category, disabled]);
 
  return (
    <>
      <MDBox
        bgColor="grey-100"
        borderRadius="lg"
        p="18px 60px 24px 70px"
        mb={1}
        mt={2}
        sx={{
          "& .slick-track": {
            transform: [1,2].includes(bundles?.length) ? "none !important" : disabled && "none !important",
            display:'flex',
            justifyContent:'center',
            width:[1,2].includes(bundles?.length) ? '100% !important' : "",
          },
        }}
      >
        <Slider ref={sliderRef} {...settings}>
          {bundles?.map((one: any, i: number) => {
            return (
              <MDBox key={i} width="98% !important" pl={1} pr={1.8}>
                <DefaultPricingCard
                  color={"white"}
                  badge={{
                    color: one?.type === "PREMIUM" ? "primary" : "rgba(222, 226, 232, 1)",
                    label: one?.type,
                  }}
                  price={{ currency: "$", value: one?.price?.toString(), type: "mo" }}
                  specifications={[
                    { label: "Project Feature on Homepage", includes: true },
                    { label: "Target specific countries and industry verticals", includes: true },
                  ]}
                  action={{
                    type: "internal",
                    route: "/",
                    color: "dark",
                    label: "join",
                  }}
                  shadow={true}
                  totalPublications={one?.publicationIds?.length}
                  reach={one?.traffic || ""}
                  handleChange={handleChange}
                  selected={selected}
                  id={one?.id}
                  pIds={one?.publicationIds}
                  disabled={disabled}
                  category={category}
                  bundle={one}
                  onclick={() => setOpen(one)}
                />
              </MDBox>
            );
          })}
        </Slider>
      </MDBox>
      {open && (
        <BundlePublicationModal
          onClose={() => setOpen(false)}
          currentPublications={open?.publicationInfo}
        />
      )}
    </>
  );
};
export default DisplayBundles;
