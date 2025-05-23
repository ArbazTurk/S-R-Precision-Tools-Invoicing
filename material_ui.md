# Using Material UI with Next.js

This document provides a comprehensive guide to integrating and using Material UI with Next.js, focusing on the latest versions and best practices. It is designed to help you replace Shadcn UI with Material UI in your Next.js project, covering setup, theming, and detailed examples for all Material UI components.

Material UI is a popular React UI framework that implements Google’s Material Design. Next.js is a powerful React framework for server-side rendering and static web applications. This guide assumes you are using Next.js 15.3.0 with the App Router and Material UI v5.x.

## Prerequisites

- Node.js version 18.17 or higher
- Next.js version 15.3.0 or higher
- Basic understanding of React and Next.js

## Installation

To use Material UI in your Next.js project, install the following packages:

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/material-nextjs
```

Or, if you prefer Yarn:

```bash
yarn add @mui/material @emotion/react @emotion/styled @mui/material-nextjs
```

Ensure your project has Next.js installed. If not, create a new Next.js project with:

```bash
npx create-next-app@latest my-app
```

Navigate to your project directory and install the above packages.

## Setting Up Material UI with Next.js App Router

Follow these steps to configure Material UI with Next.js using the App Router.

1. **Configure `app/layout.tsx`**

   In your `app/layout.tsx` file, import `AppRouterCacheProvider` and wrap your application with it to handle style caching.

   ```tsx
   import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
   import { StyledRoot } from "./StyledRoot";

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body>
           <AppRouterCacheProvider>
             <StyledRoot>{children}</StyledRoot>
           </AppRouterCacheProvider>
         </body>
       </html>
     );
   }
   ```

2. **Create Theme File**

   Create a `app/theme.ts` file to set up the theme and font (Roboto is recommended).

   ```ts
   "use client";
   import { Roboto } from "next/font/google";
   import { createTheme } from "@mui/material/styles";

   const roboto = Roboto({
     weight: ["300", "400", "500", "700"],
     subsets: ["latin"],
     display: "swap",
   });

   const theme = createTheme({
     typography: {
       fontFamily: roboto.style.fontFamily,
     },
     palette: {
       primary: {
         main: "#1976d2",
       },
     },
   });

   export default theme;
   ```

3. **Create StyledRoot Component**

   Create a `app/StyledRoot.tsx` file to wrap your application with `ThemeProvider`.

   ```tsx
   "use client";
   import { ThemeProvider } from "@mui/material/styles";
   import theme from "./theme";

   export function StyledRoot({ children }: { children: React.ReactNode }) {
     return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
   }
   ```

## Using Material UI Components in Next.js

After setting up Material UI as described, you can use any Material UI component in your Next.js pages or components as you would in a standard React application. Below are examples for **all Material UI components** listed in the [Material UI Components Documentation](https://mui.com/material-ui/all-components/), organized by category. Each example is adapted for Next.js compatibility, with `'use client'` added where necessary for client-side rendering.

### Inputs

#### Autocomplete

```tsx
"use client";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const options = ["Option 1", "Option 2", "Option 3"];

export default function MyAutocomplete() {
  return (
    <Autocomplete
      options={options}
      renderInput={(params) => (
        <TextField {...params} label="Select an option" />
      )}
      sx={{ width: 300 }}
    />
  );
}
```

#### Button

```tsx
import Button from "@mui/material/Button";

export default function MyButton() {
  return <Button variant="contained">Click Me</Button>;
}
```

#### Button Group

```tsx
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";

export default function MyButtonGroup() {
  return (
    <ButtonGroup variant="contained">
      <Button>One</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </ButtonGroup>
  );
}
```

#### Checkbox

```tsx
"use client";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useState } from "react";

export default function MyCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      }
      label="Check me"
    />
  );
}
```

#### Floating Action Button

```tsx
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

export default function MyFab() {
  return (
    <Fab color="primary" aria-label="add">
      <AddIcon />
    </Fab>
  );
}
```

#### Radio Group

```tsx
"use client";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useState } from "react";

export default function MyRadioGroup() {
  const [value, setValue] = useState("option1");

  return (
    <FormControl>
      <RadioGroup
        value={value}
        onChange={(e) => setValue(e.target.value)}
        name="radio-buttons-group"
      >
        <FormControlLabel
          value="option1"
          control={<Radio />}
          label="Option 1"
        />
        <FormControlLabel
          value="option2"
          control={<Radio />}
          label="Option 2"
        />
      </RadioGroup>
    </FormControl>
  );
}
```

#### Rating

```tsx
"use client";
import Rating from "@mui/material/Rating";
import { useState } from "react";

export default function MyRating() {
  const [value, setValue] = useState<number | null>(2);

  return (
    <Rating
      name="simple-controlled"
      value={value}
      onChange={(event, newValue) => setValue(newValue)}
    />
  );
}
```

#### Select

```tsx
"use client";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useState } from "react";

export default function MySelect() {
  const [value, setValue] = useState("");

  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel>Age</InputLabel>
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label="Age"
      >
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </FormControl>
  );
}
```

#### Slider

```tsx
"use client";
import Slider from "@mui/material/Slider";
import { useState } from "react";

export default function MySlider() {
  const [value, setValue] = useState<number[]>([20, 80]);

  return (
    <Slider
      value={value}
      onChange={(e, newValue) => setValue(newValue as number[])}
      valueLabelDisplay="auto"
      sx={{ width: 300 }}
    />
  );
}
```

#### Switch

```tsx
"use client";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useState } from "react";

export default function MySwitch() {
  const [checked, setChecked] = useState(false);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      }
      label="Toggle me"
    />
  );
}
```

#### Text Field

```tsx
import TextField from "@mui/material/TextField";

export default function MyTextField() {
  return <TextField label="Name" variant="outlined" />;
}
```

#### Toggle Button

```tsx
"use client";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

export default function MyToggleButton() {
  const [alignment, setAlignment] = useState("left");

  return (
    <ToggleButtonGroup
      value={alignment}
      exclusive
      onChange={(e, newAlignment) => setAlignment(newAlignment)}
    >
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
    </ToggleButtonGroup>
  );
}
```

#### Transfer List

```tsx
"use client";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.includes(value));
}

export default function MyTransferList() {
  const [checked, setChecked] = useState<readonly number[]>([]);
  const [left, setLeft] = useState<readonly number[]>([1, 2, 3, 4]);
  const [right, setRight] = useState<readonly number[]>([5, 6, 7, 8]);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(checked));
    setLeft(not(left, checked));
    setChecked([]);
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(checked));
    setRight(not(right, checked));
    setChecked([]);
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const customList = (items: readonly number[]) => (
    <Paper sx={{ width: 200, height: 230, overflow: "auto" }}>
      <List dense component="div" role="list">
        {items.map((value) => (
          <ListItem key={value} role="listitem" onClick={handleToggle(value)}>
            <Checkbox
              checked={checked.includes(value)}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={`Item ${value}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item>{customList(left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button variant="outlined" onClick={handleAllRight}>
            ≫
          </Button>
          <Button variant="outlined" onClick={handleCheckedRight}>
            &gt;
          </Button>
          <Button variant="outlined" onClick={handleCheckedLeft}>
            &lt;
          </Button>
          <Button variant="outlined" onClick={handleAllLeft}>
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(right)}</Grid>
    </Grid>
  );
}
```

### Navigation

#### Bottom Navigation

```tsx
"use client";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState } from "react";

export default function MyBottomNavigation() {
  const [value, setValue] = useState(0);

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => setValue(newValue)}
      sx={{ width: 500 }}
    >
      <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
      <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
      <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} />
    </BottomNavigation>
  );
}
```

#### Breadcrumbs

```tsx
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

export default function MyBreadcrumbs() {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link underline="hover" color="inherit" href="/">
        Home
      </Link>
      <Link underline="hover" color="inherit" href="/category">
        Category
      </Link>
      <span>Item</span>
    </Breadcrumbs>
  );
}
```

#### Drawer

```tsx
"use client";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useState } from "react";

export default function MyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <List>
          <ListItem>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Profile" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
```

#### Link

```tsx
import Link from "@mui/material/Link";

export default function MyLink() {
  return (
    <Link href="https://mui.com" underline="hover">
      Visit MUI
    </Link>
  );
}
```

#### Menu

```tsx
"use client";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function MyMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button onClick={handleClick}>Open Menu</Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  );
}
```

#### Pagination

```tsx
"use client";
import Pagination from "@mui/material/Pagination";
import { useState } from "react";

export default function MyPagination() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      count={10}
      page={page}
      onChange={(event, value) => setPage(value)}
      color="primary"
    />
  );
}
```

#### Speed Dial

```tsx
"use client";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";

const actions = [
  { icon: <FileCopyIcon />, name: "Copy" },
  { icon: <SaveIcon />, name: "Save" },
  { icon: <PrintIcon />, name: "Print" },
];

export default function MySpeedDial() {
  return (
    <SpeedDial
      ariaLabel="SpeedDial example"
      sx={{ position: "absolute", bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
        />
      ))}
    </SpeedDial>
  );
}
```

#### Stepper

```tsx
"use client";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useState } from "react";

const steps = ["Step 1", "Step 2", "Step 3"];

export default function MyStepper() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Stepper activeStep={activeStep}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
```

#### Tabs

```tsx
"use client";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useState } from "react";

export default function MyTabs() {
  const [value, setValue] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={value} onChange={(event, newValue) => setValue(newValue)}>
        <Tab label="Item One" />
        <Tab label="Item Two" />
        <Tab label="Item Three" />
      </Tabs>
    </Box>
  );
}
```

### Surfaces

#### Accordion

```tsx
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function MyAccordion() {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>Content goes here.</Typography>
      </AccordionDetails>
    </Accordion>
  );
}
```

#### App Bar

```tsx
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function MyAppBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">My App</Typography>
      </Toolbar>
    </AppBar>
  );
}
```

#### Card

```tsx
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function MyCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Card Title</Typography>
        <Typography variant="body2">Card content goes here.</Typography>
      </CardContent>
    </Card>
  );
}
```

#### Paper

```tsx
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function MyPaper() {
  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Typography>Content inside Paper</Typography>
    </Paper>
  );
}
```

### Feedback

#### Alert

```tsx
import Alert from "@mui/material/Alert";

export default function MyAlert() {
  return <Alert severity="success">This is a success alert!</Alert>;
}
```

#### Backdrop

```tsx
"use client";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function MyBackdrop() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Backdrop</Button>
      <Backdrop open={open} onClick={() => setOpen(false)}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
```

#### Dialog

```tsx
"use client";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function MyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogContent>
          <p>Dialog content goes here.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
```

#### Progress

```tsx
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function MyProgress() {
  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress />
    </Box>
  );
}
```

#### Skeleton

```tsx
import Skeleton from "@mui/material/Skeleton";

export default function MySkeleton() {
  return <Skeleton variant="rectangular" width={210} height={118} />;
}
```

#### Snackbar

```tsx
"use client";
import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function MySnackbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Snackbar</Button>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message="This is a snackbar"
      />
    </>
  );
}
```

### Data Display

#### Avatar

```tsx
import Avatar from "@mui/material/Avatar";

export default function MyAvatar() {
  return <Avatar alt="User" src="/static/images/avatar.jpg" />;
}
```

#### Badge

```tsx
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";

export default function MyBadge() {
  return (
    <Badge badgeContent={4} color="primary">
      <MailIcon />
    </Badge>
  );
}
```

#### Chip

```tsx
import Chip from "@mui/material/Chip";

export default function MyChip() {
  return <Chip label="Chip" />;
}
```

#### Divider

```tsx
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

export default function MyDivider() {
  return (
    <>
      <Typography>Above</Typography>
      <Divider />
      <Typography>Below</Typography>
    </>
  );
}
```

#### Icons

```tsx
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function MyIcon() {
  return <FavoriteIcon color="primary" />;
}
```

#### Material Icons

```tsx
import DeleteIcon from "@mui/icons-material/Delete";

export default function MyMaterialIcon() {
  return <DeleteIcon color="error" />;
}
```

#### List

```tsx
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

export default function MyList() {
  return (
    <List>
      <ListItem>
        <ListItemText primary="Item 1" />
      </ListItem>
      <ListItem>
        <ListItemText primary="Item 2" />
      </ListItem>
    </List>
  );
}
```

#### Table

```tsx
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function MyTable() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Age</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane</TableCell>
            <TableCell>22</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

#### Tooltip

```tsx
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";

export default function MyTooltip() {
  return (
    <Tooltip title="Delete">
      <Button>Hover me</Button>
    </Tooltip>
  );
}
```

#### Typography

```tsx
import Typography from "@mui/material/Typography";

export default function MyTypography() {
  return <Typography variant="h4">Heading</Typography>;
}
```

### Layout

#### Box

```tsx
import Box from "@mui/material/Box";

export default function MyBox() {
  return (
    <Box sx={{ bgcolor: "primary.main", color: "white", p: 2 }}>
      Box Content
    </Box>
  );
}
```

#### Container

```tsx
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function MyContainer() {
  return (
    <Container maxWidth="sm">
      <Typography>Container Content</Typography>
    </Container>
  );
}
```

#### Grid

```tsx
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

export default function MyGrid() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Paper elevation={3}>Item 1</Paper>
      </Grid>
      <Grid item xs={6}>
        <Paper elevation={3}>Item 2</Paper>
      </Grid>
    </Grid>
  );
}
```

#### Grid2 (New in v5.15)

```tsx
import Grid2 from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";

export default function MyGrid2() {
  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={6}>
        <Paper elevation={3}>Item 1</Paper>
      </Grid2>
      <Grid2 xs={6}>
        <Paper elevation={3}>Item 2</Paper>
      </Grid2>
    </Grid2>
  );
}
```

#### Image List

```tsx
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

export default function MyImageList() {
  return (
    <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
      {[{ img: "/static/image1.jpg", title: "Image 1" }].map((item) => (
        <ImageListItem key={item.img}>
          <img src={item.img} alt={item.title} loading="lazy" />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
```

#### Stack

```tsx
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function MyStack() {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained">Button 1</Button>
      <Button variant="contained">Button 2</Button>
    </Stack>
  );
}
```

### Utils

#### Click-Away Listener

```tsx
"use client";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Box from "@mui/material/Box";
import { useState } from "react";

export default function MyClickAwayListener() {
  const [open, setOpen] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative" }}>
        <button onClick={() => setOpen(true)}>Open</button>
        {open && (
          <Box sx={{ bgcolor: "background.paper", p: 2, boxShadow: 1 }}>
            Click outside to close
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}
```

#### Modal

```tsx
"use client";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function MyModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 4,
            margin: "auto",
            mt: 10,
            width: 400,
          }}
        >
          Modal Content
        </Box>
      </Modal>
    </>
  );
}
```

#### NoSsr

```tsx
import NoSsr from "@mui/material/NoSsr";
import Typography from "@mui/material/Typography";

export default function MyNoSsr() {
  return (
    <NoSsr>
      <Typography>Client-only content</Typography>
    </NoSsr>
  );
}
```

#### Popover

```tsx
"use client";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export default function MyPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Button onClick={handleClick}>Open Popover</Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Typography sx={{ p: 2 }}>Popover content</Typography>
      </Popover>
    </>
  );
}
```

#### Popper

```tsx
"use client";
import Popper from "@mui/material/Popper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function MyPopper() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Button onClick={handleClick}>Toggle Popper</Button>
      <Popper open={open} anchorEl={anchorEl}>
        <Box sx={{ bgcolor: "background.paper", p: 1, boxShadow: 1 }}>
          Popper content
        </Box>
      </Popper>
    </>
  );
}
```

#### Portal

```tsx
"use client";
import Portal from "@mui/material/Portal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function MyPortal() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button onClick={() => setShow(!show)}>Toggle Portal</Button>
      {show && (
        <Portal>
          <Box
            sx={{
              position: "absolute",
              top: 50,
              left: 50,
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            Portal content
          </Box>
        </Portal>
      )}
    </>
  );
}
```

#### Textarea Autosize

```tsx
import TextareaAutosize from "@mui/material/TextareaAutosize";

export default function MyTextareaAutosize() {
  return <TextareaAutosize minRows={3} placeholder="Type here..." />;
}
```

#### Transitions

```tsx
"use client";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useState } from "react";

export default function MyTransition() {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Button onClick={() => setChecked((prev) => !prev)}>Toggle</Button>
      <Collapse in={checked}>
        <Box sx={{ bgcolor: "background.paper", p: 2 }}>
          Collapsible content
        </Box>
      </Collapse>
    </>
  );
}
```

## Theming

Customize your application’s appearance by modifying the theme. For example, to change the primary color:

```ts
// app/theme.ts
"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

export default theme;
```

For more on theming, see the [Material UI Theming Guide](https://mui.com/material-ui/customization/theming/).

## Customizing Components

Style Material UI components using Emotion. For example, a custom button:

```tsx
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

const CustomButton = styled(Button)({
  backgroundColor: "#ff4081",
  "&:hover": {
    backgroundColor: "#f50057",
  },
});

export default function MyComponent() {
  return <CustomButton variant="contained">Custom Button</CustomButton>;
}
```

## Troubleshooting

- **Styles not applying correctly**: Ensure you’ve wrapped your app with `AppRouterCacheProvider` and `ThemeProvider`.
- **Components not rendering on the server**: Add `'use client'` for components using hooks or client-side features.
- **Font not loading**: Verify the font is correctly set in the theme file and loaded.

For further assistance, check [Material UI GitHub Issues](https://github.com/mui/material-ui/issues) or [Next.js Discussions](https://github.com/vercel/next.js/discussions).

## References

- [Material UI Documentation](https://mui.com/material-ui/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Next.js Integration](https://mui.com/material-ui/integrations/nextjs/)
- [Material UI Theming](https://mui.com/material-ui/customization/theming/)
- [Material UI Components](https://mui.com/material-ui/all-components/)
