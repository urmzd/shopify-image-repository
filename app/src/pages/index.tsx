import React, { useReducer } from 'react'
import { navigate } from 'gatsby'
import {
    Typography,
    Grid,
    IconButton,
    GridProps,
    Fade,
    CircularProgress,
} from '@material-ui/core'
import { CloudUpload, PlayCircleFilled } from '@material-ui/icons'
import '../styles/index.css'

enum SubContainerActionTypes {
  INCREMENT = 'increment',
}

export enum PageLocations {
  INDEX = '/',
  PLAY = '/play',
  UPLOAD = '/upload',
}

export enum StyleTransitions {
  DEFAULT = 'all ease-in-out 750ms',
}

enum Colours {
  TRANSPARENT = 'transparent',
  SHOPIFY_GREEN = '#96bf48',
  WHITE = '#fff',
  BLACK = '#000',
}

enum UIEventStates {
  DEFAULT = 50,
  HOVERING = 80,
  CLICKED = 100,
}

type SubContainerList = IndexPageSubContainerWrapperProps[];

type SubContainerIndex = 0 | 1;

type SubContainerState = {
  subContainers: [number, number];
};

type SubContainerAction = {
  type: SubContainerActionTypes;
  payload: {
    subContainerIndex: SubContainerIndex;
    subContainerEventState: UIEventStates;
  };
};

type IndexPageSubContainerWrapperProps = {
  children: JSX.Element;
  label: PageLocations;
  index: SubContainerIndex;
  eventState: UIEventStates;
  goTo: () => void;
  setEventState: (eventState: UIEventStates) => void;
};

type CustomIconButtonProps = Pick<
  IndexPageSubContainerWrapperProps,
  'children' | 'eventState'
>;

export const PageContainerStyle = {
    minHeight: '100vh',
    minWidth: '100vw',
}

const CustomIconButtonStyles = (eventState?: UIEventStates) => ({
    color: eventState > UIEventStates.DEFAULT ? Colours.WHITE : Colours.BLACK,
    fontSize: '3rem',
    transition: StyleTransitions.DEFAULT,
})

const SubContainerLabelStyles = {
    transition: StyleTransitions.DEFAULT,
    color: Colours.WHITE,
}

const SubContainerStyles = (eventState: UIEventStates) => ({
    height: `${eventState}vh`,
    background:
    eventState > UIEventStates.DEFAULT
        ? Colours.SHOPIFY_GREEN
        : Colours.TRANSPARENT,
    opacity: `${eventState > 0 ? 1 : 0}`,
    transition: StyleTransitions.DEFAULT,
})

const CustomIconButton = ({ children, eventState }: CustomIconButtonProps) => (
    <Fade in={!!eventState}>
        <IconButton style={CustomIconButtonStyles(eventState)}>
            {children}
        </IconButton>
    </Fade>
)

const IndexPageSubContainerWrapper = ({
    eventState,
    setEventState,
    children,
    label,
    goTo,
}: IndexPageSubContainerWrapperProps) => (
    <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
        alignContent="center"
        style={SubContainerStyles(eventState)}
        onMouseEnter={() => setEventState(UIEventStates.HOVERING)}
        onTransitionEnd={() => eventState === UIEventStates.CLICKED && goTo()}
        onClick={() => setEventState(UIEventStates.CLICKED)}
    >
        <Fade in={eventState === UIEventStates.CLICKED}>
            <>
                <CustomIconButton eventState={eventState}>
                    {eventState === UIEventStates.CLICKED ? (
                        <CircularProgress color="inherit" />
                    ) : (
                        children
                    )}
                </CustomIconButton>
                <Grid item style={SubContainerLabelStyles}>
                    <Typography>
                        {eventState !== UIEventStates.CLICKED
                            ? `PRESS TO ${label.replace('/', '').toUpperCase()}`
                            : 'Loading...'}
                    </Typography>
                </Grid>
            </>
        </Fade>
    </Grid>
)

const subContainerInitialState: SubContainerState = {
    subContainers: [UIEventStates.HOVERING, 100 - UIEventStates.HOVERING],
}

const subContainerIncrement = (
    index: SubContainerIndex,
    eventState: UIEventStates
): SubContainerAction => ({
    type: SubContainerActionTypes.INCREMENT,
    payload: {
        subContainerIndex: index,
        subContainerEventState: eventState,
    },
})

const subContainerReducer = (
    state: SubContainerState,
    {
        type,
        payload: { subContainerIndex, subContainerEventState },
    }: SubContainerAction
) => {
    if (type === SubContainerActionTypes.INCREMENT) {
        return {
            subContainers: state.subContainers.map((_, index) =>
                index === subContainerIndex
                    ? subContainerEventState
                    : UIEventStates.CLICKED - subContainerEventState
            ),
        }
    }

    return state
}

export type PageContainerProps = {
  children: JSX.Element;
  props?: GridProps;
};

export const PageContainer = ({
    props = {},
    children,
}: PageContainerProps): JSX.Element => (
    <Grid
        container
        style={PageContainerStyle}
        alignItems="center"
        justify="center"
        {...props}
    >
        {children}
    </Grid>
)

const IndexPage = (): JSX.Element => {
    const [state, dispatch] = useReducer(
        subContainerReducer,
        subContainerInitialState
    )

    const containers: SubContainerList = [
        {
            index: 0,
            eventState: state.subContainers[0],
            setEventState: (eventState) =>
                dispatch(subContainerIncrement(0, eventState)),
            children: <PlayCircleFilled fontSize="inherit" />,
            label: PageLocations.PLAY,
            goTo: () => navigate(PageLocations.PLAY),
        },
        {
            index: 1,
            eventState: state.subContainers[1],
            setEventState: (eventState) =>
                dispatch(subContainerIncrement(1, eventState)),
            children: <CloudUpload fontSize="inherit" />,
            label: PageLocations.UPLOAD,
            goTo: () => navigate(PageLocations.UPLOAD),
        },
    ]

    return (
        <PageContainer
            props={{
                justify: 'space-evenly',
                direction: 'column',
                alignItems: 'stretch',
            }}
        >
            <>
                {containers
                    .map(({ index, ...container }) => ({
                        index,
                        children: (
                            <IndexPageSubContainerWrapper {...container} index={index} />
                        ),
                    }))
                    .map(({ index, children }) => (
                        <Grid item key={index}>
                            {children}
                        </Grid>
                    ))}
            </>
        </PageContainer>
    )
}

export default IndexPage
