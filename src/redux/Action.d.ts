import { Action as ReduxAction } from "redux";

export interface Action<Type extends string, Payload> extends ReduxAction {
    type: Type;
    payload: Payload;
}

export type UnhandledAction = Action<"__ANY_UNHANDLED_ACTION_TYPE", any>;
