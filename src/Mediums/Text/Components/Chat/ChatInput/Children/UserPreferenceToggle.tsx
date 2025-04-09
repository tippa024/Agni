import { UserPreferences } from "@/Mediums/Chat/Utils/prompt&type";
import { Switch } from "@/Mediums/Chat/Components/ChatInput/ui/Switch";
import { Label } from "@/Mediums/Chat/Components/ChatInput/ui/Label";
import { Dispatch, memo, SetStateAction } from "react";

export const UserPreferenceToggle = function UserPreferenceToggle({
    userPreferences,
    setUserPreferences,
}: {
    userPreferences: UserPreferences;
    setUserPreferences: Dispatch<SetStateAction<UserPreferences>>;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 p-3">
                <div className="flex flex-col gap-2 w-[140px] border-r border-[#4A4235]/10 my-2">
                    {/* Search Toggle */}
                    <div className="flex items-start gap-2">
                        <Switch
                            checked={userPreferences.searchEnabled}
                            onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                    setUserPreferences({
                                        ...userPreferences,
                                        searchEnabled: true,
                                        searchProvider: "OpenPerplex"
                                    });
                                } else {
                                    setUserPreferences({
                                        ...userPreferences,
                                        searchEnabled: false
                                    });
                                }
                            }}
                        />
                        <Label className={`text-sm transition-opacity duration-200 ${userPreferences.searchEnabled ? 'text-[#4A4235] font-medium opacity-100' : 'text-[#4A4235] opacity-50'}`}>
                            Search
                        </Label>
                    </div>

                    {/* Model Selector */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex ml-2.5 items-center justify-center">
                            {userPreferences.model[1] === "OpenAI" ? (
                                <svg viewBox="0 0 24 24" className="w-5 h-5">
                                    <path
                                        fill="currentColor"
                                        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                                    />
                                </svg>
                            ) : (
                                <svg height="1em" viewBox="0 0 24 24" width="1em" className="w-5 h-5">
                                    <path
                                        d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
                                        fill="#D97757"
                                        fillRule="nonzero"
                                    />
                                </svg>
                            )}
                        </div>
                        <select
                            value={userPreferences.model[0]}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "gpt-4o-mini") {
                                    setUserPreferences(prev => ({ ...prev, model: ["gpt-4o-mini", "OpenAI"] }));
                                } else if (value === "gpt-4o") {
                                    setUserPreferences(prev => ({ ...prev, model: ["gpt-4o", "OpenAI"] }));
                                } else if (value === "claude-3-5-haiku-20241022") {
                                    setUserPreferences(prev => ({ ...prev, model: ["claude-3-5-haiku-20241022", "Anthropic"] }));
                                } else if (value === "claude-3-5-sonnet-20241022") {
                                    setUserPreferences(prev => ({ ...prev, model: ["claude-3-5-sonnet-20241022", "Anthropic"] }));
                                }
                            }}
                            className="appearance-none text-sm bg-transparent border border-white rounded-lg px-1 mx-1.5 py-1.5 
                         focus:outline-none focus:border-[#4A4235]/40 focus:ring-1 focus:ring-[#4A4235]/20
                         cursor-pointer transition-all duration-100 hover:border-[#4A4235]/30
                         text-[#4A4235] font-medium max-w-[97px]"
                        >
                            <option value="claude-3-5-haiku-20241022">Haiku 3.5</option>
                            <option value="gpt-4o-mini">4o Mini</option>
                            <option value="gpt-4o">4o</option>
                            <option value="claude-3-5-sonnet-20241022">Sonnet 3.5</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}
