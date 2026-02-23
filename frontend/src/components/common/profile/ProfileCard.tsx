import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, signout } from "../../../api/authApi";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/Routes";
import { useConfirm } from "../confirm/ConfirmProvider";
import { getApiErrorMessage, notify } from "../../../utils/notify";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleFilled,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";

const ProfileCard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      queryClient.cancelQueries({ queryKey: ["currentUser"] });

      queryClient.setQueryData(["currentUser"], null);

      queryClient.setQueryData(["bills"], { bills: [] });
      queryClient.setQueryData(["products"], { products: [] });
      queryClient.setQueryData(["companies"], { companies: [] });
      queryClient.setQueryData(["users"], { users: [] });

      notify.success("Signed out successfully");
      setTimeout(() => navigate(ROUTES.AUTH.SIGNIN), 700);
    },
    onError: (err: unknown) => {
      notify.error(getApiErrorMessage(err, "Sign out failed"));
    },
  });

  const user = data?.user;
  const name = user?.name || "";
  const email = user?.email || "";
  const role = user?.role || "";
  const phone = user?.phone || "";
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const profileStrength = Math.min(
    100,
    [name, email, phone, user?.city, user?.state].filter(Boolean).length * 20
  );

  const handleLogout = async () => {
    if (isPending) return;
    const shouldLogout = await confirm({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      intent: "danger",
    });
    if (shouldLogout) mutate();
  };

  return (
    <div className="space-y-4">
      <Card
        className="!overflow-hidden !rounded-xl !border-[#d8e1ef] !bg-white"
        style={{ boxShadow: "none", textShadow: "none" }}
        styles={{ body: { padding: 0 } }}
      >
        <div className="h-24 bg-[linear-gradient(130deg,#3a59cd_0%,#2950c2_55%,#446bd8_100%)]" />
        <div className="-mt-11 px-5 pb-5">
          <div className="flex items-start justify-between gap-3">
            <Avatar
              size={86}
              src={null}
              icon={<UserOutlined />}
              className="!border-4 !border-white !bg-[#2f55d4] !text-3xl !font-semibold !text-white"
            >
              {!isLoading ? initial : ""}
            </Avatar>
            <Tag
              className="!mt-2 !rounded-full !border-[#d8e1ef] !bg-[#edf3ff] !px-3 !py-[2px] !text-[11px] !font-semibold !uppercase !tracking-[0.08em] !text-[#2f55d4]"
              style={{ boxShadow: "none", textShadow: "none" }}
            >
              <Space size={4}>
                <SafetyOutlined />
                {isLoading ? "loading" : role || "user"}
              </Space>
            </Tag>
          </div>

          <div className="mt-3">
            <Typography.Title level={4} className="!mb-0 !text-[#1e2b4a]">
              {isLoading ? "Loading..." : name || "Unknown User"}
            </Typography.Title>
            <Typography.Text className="!text-[13px] !text-[#7180a0]">
              Medico Billing Account
            </Typography.Text>
          </div>

          <Divider className="!my-4 !border-[#e4eaf5]" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Space size={8} className="!text-[#6f7d99]">
                <MailOutlined />
                <Typography.Text className="!text-[#6f7d99]">Email</Typography.Text>
              </Space>
              <Typography.Text className="max-w-[60%] !truncate !text-right !text-[#2f3e63]">
                {isLoading ? "-" : email || "-"}
              </Typography.Text>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Space size={8} className="!text-[#6f7d99]">
                <PhoneOutlined />
                <Typography.Text className="!text-[#6f7d99]">Phone</Typography.Text>
              </Space>
              <Typography.Text className="!text-[#2f3e63]">
                {isLoading ? "-" : phone || "Not Added"}
              </Typography.Text>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Space size={8} className="!text-[#6f7d99]">
                <CheckCircleFilled />
                <Typography.Text className="!text-[#6f7d99]">
                  Profile Strength
                </Typography.Text>
              </Space>
              <Typography.Text className="!font-semibold !text-[#2f55d4]">
                {profileStrength}%
              </Typography.Text>
            </div>
          </div>

          <Button
            block
            onClick={handleLogout}
            disabled={isPending}
            className="!mt-5 !h-10 !rounded-lg !border-[#d8e1ef] !text-[#334368]"
            icon={<LogoutOutlined />}
            style={{ boxShadow: "none" }}
          >
            {isPending ? "Signing out..." : "Log Out"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfileCard;
