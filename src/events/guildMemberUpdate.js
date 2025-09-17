import { Events } from "discord.js";
import { sendToLaravel } from "../services/laravelService.js";
import { logger } from "../lib/logger.js";
import { normalizePayload } from "../lib/normalizePayload.js";
import { buildRoleContext } from "../lib/contextBuilders.js";
import { matchRoleTask } from "../services/taskService.js";
import { handleLaravelResponse } from "../utils/responseHandler.js";

export default {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    try {
      const addedRoles = newMember.roles.cache.filter(
        (role) => !oldMember.roles.cache.has(role.id)
      );

      for (const role of addedRoles.values()) {
        const roleTask = matchRoleTask(role.id); // ✅ pass roleId
        if (roleTask) {
          const payload = normalizePayload({
            task: roleTask,
            user: newMember.user,
            context: buildRoleContext(role),
          });

          logger.info(payload, "Role task matched");
          await sendToLaravel(payload);
        }
      }
    } catch (err) {
      logger.error({ err: err.message }, "Error in GuildMemberUpdate handler");
    }
  },
};
